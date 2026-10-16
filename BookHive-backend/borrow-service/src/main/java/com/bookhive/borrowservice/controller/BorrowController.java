package com.bookhive.borrowservice.controller;

import com.bookhive.borrowservice.dto.BorrowRequest;
import com.bookhive.borrowservice.model.Borrow;
import com.bookhive.borrowservice.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    private final BorrowService borrowService;

    @Autowired
    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @GetMapping
    public ResponseEntity<List<Borrow>> getAllBorrows() {
        return ResponseEntity.ok(borrowService.getAllBorrows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Borrow> getBorrowById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.getBorrowById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Borrow>> getBorrowsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getBorrowsByUser(userId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<Borrow> reserveBook(@RequestBody BorrowRequest request) {
        return ResponseEntity.ok(borrowService.reserveBook(request));
    }

    @PutMapping("/{id}/collect")
    public ResponseEntity<Borrow> markCollected(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.markCollected(id));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Borrow> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.returnBook(id));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Borrow Service is running");
    }
}