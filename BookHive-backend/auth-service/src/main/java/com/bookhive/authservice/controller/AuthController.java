package com.bookhive.authservice.controller;

import com.bookhive.authservice.dto.AuthResponse;
import com.bookhive.authservice.dto.LoginRequest;
import com.bookhive.authservice.dto.RegisterRequest;
import com.bookhive.authservice.dto.ResetPasswordRequest;
import com.bookhive.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running");
    }

    @GetMapping("/users")
    public ResponseEntity<List<com.bookhive.authservice.model.User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}