package com.bookhive.fineservice.repository;

import com.bookhive.fineservice.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByUserId(Long userId);
    List<Fine> findByBorrowId(Long borrowId);
    List<Fine> findByStatus(Fine.FineStatus status);
    Optional<Fine> findByBorrowIdAndStatus(Long borrowId, Fine.FineStatus status);
}
