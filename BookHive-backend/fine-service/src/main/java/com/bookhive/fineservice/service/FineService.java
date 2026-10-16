package com.bookhive.fineservice.service;

import com.bookhive.fineservice.dto.FineRequest;
import com.bookhive.fineservice.dto.PaymentRequest;
import com.bookhive.fineservice.model.Fine;
import com.bookhive.fineservice.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FineService {

    private final FineRepository fineRepository;

    @Autowired
    public FineService(FineRepository fineRepository) {
        this.fineRepository = fineRepository;
    }

    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    public Fine getFineById(Long id) {
        return fineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fine record not found with id: " + id));
    }

    public List<Fine> getFinesByUserId(Long userId) {
        return fineRepository.findByUserId(userId);
    }

    public Fine createFine(FineRequest request) {
        return fineRepository.findByBorrowIdAndStatus(request.getBorrowId(), Fine.FineStatus.UNPAID)
                .orElseGet(() -> {
                    Fine fine = Fine.builder()
                            .borrowId(request.getBorrowId())
                            .userId(request.getUserId())
                            .userName(request.getUserName())
                            .bookTitle(request.getBookTitle())
                            .amount(request.getAmount())
                            .status(Fine.FineStatus.UNPAID)
                            .createdAt(LocalDateTime.now())
                            .daysLate(request.getDaysLate())
                            .ratePerDay(request.getRatePerDay())
                            .reason(request.getReason())
                            .build();
                    return fineRepository.save(fine);
                });
    }

    public Fine payFine(Long id, PaymentRequest request) {
        Fine fine = getFineById(id);
        if (fine.getStatus() == Fine.FineStatus.PAID) {
            throw new RuntimeException("Fine has already been settled");
        }

        fine.setStatus(Fine.FineStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());
        fine.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Card/Debit");
        fine.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        fine.setReceiptNo("REC-" + System.currentTimeMillis());

        return fineRepository.save(fine);
    }
}