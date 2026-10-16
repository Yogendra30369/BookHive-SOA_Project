package com.bookhive.authservice.service;

import com.bookhive.authservice.dto.AuthResponse;
import com.bookhive.authservice.dto.LoginRequest;
import com.bookhive.authservice.dto.RegisterRequest;
import com.bookhive.authservice.dto.ResetPasswordRequest;
import com.bookhive.authservice.model.User;
import com.bookhive.authservice.repository.UserRepository;
import com.bookhive.authservice.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.util.List;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return findUserByUsernameOrEmail(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || !request.getEmail().trim().toLowerCase().endsWith("@kluniversity.in")) {
            throw new RuntimeException("Email must be an official KL University email ending with @kluniversity.in");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (request.getPassword() == null
                || request.getPassword().length() < 6
                || !request.getPassword().matches(".*[A-Z].*")
                || !request.getPassword().matches(".*[a-z].*")
                || !request.getPassword().matches(".*[0-9].*")
                || !request.getPassword().matches(".*[^A-Za-z0-9].*")) {
            throw new RuntimeException("Password does not meet required criteria: Must be at least 6 characters, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        User.Role role = User.Role.USER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            role = User.Role.ADMIN;
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        UserDetails userDetails = loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails, role.name());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(role.name())
                .message("Registration successful")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = findUserByUsernameOrEmail(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        UserDetails userDetails = loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        if (request.getIdentifier() == null || request.getIdentifier().isBlank()) {
            throw new IllegalArgumentException("Email or username is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        User user = findUserByUsernameOrEmail(request.getIdentifier().trim())
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return AuthResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .message("Password reset successful")
                .build();
    }

    private java.util.Optional<User> findUserByUsernameOrEmail(String identifier) {
        return userRepository.findByUsernameOrEmail(identifier, identifier);
    }

    @PostConstruct
    private void ensureFixedAdminAccount() {
        final String adminEmail = "khaja.ameensk@gmail.com";
        final String adminPassword = "Ameen@1111";

        User admin = userRepository.findByEmail(adminEmail).orElseGet(() ->
                User.builder()
                        .username("admin")
                        .email(adminEmail)
                        .build());

        admin.setRole(User.Role.ADMIN);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
