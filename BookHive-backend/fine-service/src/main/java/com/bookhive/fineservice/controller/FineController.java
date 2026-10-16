package com.bookhive.fineservice.controller;

import com.bookhive.fineservice.dto.FineRequest;
import com.bookhive.fineservice.dto.PaymentRequest;
import com.bookhive.fineservice.model.Fine;
import com.bookhive.fineservice.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    @Autowired
    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fine> getFineById(@PathVariable Long id) {
        return ResponseEntity.ok(fineService.getFineById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Fine>> getFinesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(fineService.getFinesByUserId(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<Fine> createFine(@RequestBody FineRequest request) {
        return ResponseEntity.ok(fineService.createFine(request));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Fine> payFine(@PathVariable Long id, @RequestBody(required = false) PaymentRequest request) {
        if (request == null) {
            request = new PaymentRequest("Online Payment", null);
        }
        return ResponseEntity.ok(fineService.payFine(id, request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Fine Service is running");
    }
}