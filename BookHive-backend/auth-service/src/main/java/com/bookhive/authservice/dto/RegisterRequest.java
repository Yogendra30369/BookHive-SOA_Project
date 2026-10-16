package com.bookhive.authservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String mobile;

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public RegisterRequest(String username, String email, String password, String role, String phone) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.mobile = phone;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() {
        return (phone != null && !phone.isBlank()) ? phone : mobile;
    }
    public void setPhone(String phone) {
        this.phone = phone;
        if (this.mobile == null) this.mobile = phone;
    }

    public String getMobile() {
        return (mobile != null && !mobile.isBlank()) ? mobile : phone;
    }
    public void setMobile(String mobile) {
        this.mobile = mobile;
        if (this.phone == null) this.phone = mobile;
    }
}
