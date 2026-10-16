package com.bookhive.authservice.dto;

public class ResetPasswordRequest {
    private String identifier;
    private String newPassword;

    public ResetPasswordRequest() {}

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
