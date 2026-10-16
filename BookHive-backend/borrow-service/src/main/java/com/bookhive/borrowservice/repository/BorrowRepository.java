package com.bookhive.borrowservice.repository;

import com.bookhive.borrowservice.model.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    List<Borrow> findByUserId(Long userId);
    List<Borrow> findByBookId(Long bookId);
    List<Borrow> findByStatus(Borrow.BorrowStatus status);
    List<Borrow> findByReturnDateBeforeAndStatus(LocalDate date, Borrow.BorrowStatus status);
    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, Borrow.BorrowStatus status);
    boolean existsByUserIdAndBookIdAndStatusIn(Long userId, Long bookId, List<Borrow.BorrowStatus> statuses);
}
