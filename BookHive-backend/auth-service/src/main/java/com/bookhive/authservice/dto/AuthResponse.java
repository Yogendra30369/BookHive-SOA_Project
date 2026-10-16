package com.bookhive.authservice.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String email, String role, String message) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public AuthResponse(String token, String username, String email, String phone, String role, String message) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.message = message;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private String email;
        private String phone;
        private String role;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, username, email, phone, role, message);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
