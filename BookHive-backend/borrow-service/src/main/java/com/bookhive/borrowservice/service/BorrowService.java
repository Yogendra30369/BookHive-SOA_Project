package com.bookhive.borrowservice.service;

import com.bookhive.borrowservice.dto.BorrowRequest;
import com.bookhive.borrowservice.feign.BookServiceClient;
import com.bookhive.borrowservice.feign.FineServiceClient;
import com.bookhive.borrowservice.model.Borrow;
import com.bookhive.borrowservice.model.Borrow.BorrowStatus;
import com.bookhive.borrowservice.repository.BorrowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BorrowService {

    private static final Logger log = LoggerFactory.getLogger(BorrowService.class);

    private final BorrowRepository borrowRepository;
    private final BookServiceClient bookServiceClient;
    private final FineServiceClient fineServiceClient;

    @Value("${app.loan.period:14}")
    private int defaultLoanPeriod;

    @Value("${app.fine.rate-per-day:2.50}")
    private double fineRatePerDay;

    @Autowired
    public BorrowService(BorrowRepository borrowRepository, BookServiceClient bookServiceClient, FineServiceClient fineServiceClient) {
        this.borrowRepository = borrowRepository;
        this.bookServiceClient = bookServiceClient;
        this.fineServiceClient = fineServiceClient;
    }

    public List<Borrow> getAllBorrows() {
        List<Borrow> borrows = borrowRepository.findAll();
        LocalDate today = LocalDate.now();
        for (Borrow b : borrows) {
            if ((b.getStatus() == BorrowStatus.ACTIVE || b.getStatus() == BorrowStatus.RESERVED)
                    && today.isAfter(b.getReturnDate())) {
                b.setStatus(BorrowStatus.OVERDUE);
                borrowRepository.save(b);
            }
        }
        return borrows;
    }

    public List<Borrow> getBorrowsByUser(Long userId) {
        return borrowRepository.findByUserId(userId);
    }

    public Borrow getBorrowById(Long id) {
        return borrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + id));
    }

    public Borrow reserveBook(BorrowRequest request) {
        boolean alreadyBorrowed = borrowRepository.existsByUserIdAndBookIdAndStatusIn(
                request.getUserId(),
                request.getBookId(),
                List.of(BorrowStatus.RESERVED, BorrowStatus.ACTIVE, BorrowStatus.OVERDUE)
        );
        if (alreadyBorrowed) {
            throw new RuntimeException("You already have this book. Return it before reserving it again.");
        }

        try {
            bookServiceClient.decrementCopy(request.getBookId());
        } catch (Exception e) {
            log.warn("Could not call BookService to decrement copy: {}", e.getMessage());
        }

        int loanDays = (request.getLoanDays() != null && request.getLoanDays() > 0)
                ? request.getLoanDays()
                : defaultLoanPeriod;

        LocalDate issueDate = LocalDate.now();
        LocalDate returnDate = issueDate.plusDays(loanDays);

        Borrow borrow = Borrow.builder()
                .userId(request.getUserId())
                .bookId(request.getBookId())
                .userName(request.getUserName() != null ? request.getUserName() : "User #" + request.getUserId())
                .bookTitle(request.getBookTitle() != null ? request.getBookTitle() : "Book #" + request.getBookId())
                .issueDate(issueDate)
                .returnDate(returnDate)
                .status(BorrowStatus.RESERVED)
                .build();

        return borrowRepository.save(borrow);
    }

    public Borrow markCollected(Long borrowId) {
        Borrow borrow = getBorrowById(borrowId);
        if (borrow.getStatus() != BorrowStatus.RESERVED) {
            throw new RuntimeException("Borrow is not in RESERVED status (Current: " + borrow.getStatus() + ")");
        }
        borrow.setStatus(BorrowStatus.ACTIVE);
        return borrowRepository.save(borrow);
    }

    public Borrow returnBook(Long borrowId) {
        Borrow borrow = getBorrowById(borrowId);

        if (borrow.getStatus() == BorrowStatus.RETURNED) {
            throw new RuntimeException("Book already returned");
        }

        LocalDate today = LocalDate.now();
        borrow.setActualReturnDate(today);

        if (today.isAfter(borrow.getReturnDate())) {
            long daysLate = ChronoUnit.DAYS.between(borrow.getReturnDate(), today);
            double amount = daysLate * fineRatePerDay;

            try {
                Map<String, Object> fineRequest = new HashMap<>();
                fineRequest.put("borrowId", borrow.getBorrowId());
                fineRequest.put("userId", borrow.getUserId());
                fineRequest.put("userName", borrow.getUserName());
                fineRequest.put("bookTitle", borrow.getBookTitle());
                fineRequest.put("amount", amount);
                fineRequest.put("daysLate", daysLate);
                fineRequest.put("ratePerDay", fineRatePerDay);
                fineRequest.put("reason", "Returned " + daysLate + " days late");

                fineServiceClient.createFine(fineRequest);
                log.info("Fine created for borrow {}: {} USD", borrowId, amount);
            } catch (Exception e) {
                log.error("Failed to notify FineService: {}", e.getMessage());
            }
        }

        try {
            bookServiceClient.incrementCopy(borrow.getBookId());
        } catch (Exception e) {
            log.warn("Could not call BookService to increment copy: {}", e.getMessage());
        }

        borrow.setStatus(BorrowStatus.RETURNED);
        return borrowRepository.save(borrow);
    }
}