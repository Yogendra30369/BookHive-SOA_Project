package com.bookhive.fineservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fineId;

    @Column(nullable = false)
    private Long borrowId;

    private Long userId;
    private String userName;
    private String bookTitle;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FineStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String paymentMethod;
    private String transactionId;
    private String receiptNo;
    private Long daysLate;
    private Double ratePerDay;
    private String reason;

    public enum FineStatus {
        UNPAID, PAID
    }

    public Fine() {}

    public Fine(Long fineId, Long borrowId, Long userId, String userName, String bookTitle, Double amount, FineStatus status, LocalDateTime createdAt, LocalDateTime paidAt, String paymentMethod, String transactionId, String receiptNo, Long daysLate, Double ratePerDay, String reason) {
        this.fineId = fineId;
        this.borrowId = borrowId;
        this.userId = userId;
        this.userName = userName;
        this.bookTitle = bookTitle;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
        this.paidAt = paidAt;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.receiptNo = receiptNo;
        this.daysLate = daysLate;
        this.ratePerDay = ratePerDay;
        this.reason = reason;
    }

    public static FineBuilder builder() {
        return new FineBuilder();
    }

    public static class FineBuilder {
        private Long fineId;
        private Long borrowId;
        private Long userId;
        private String userName;
        private String bookTitle;
        private Double amount;
        private FineStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime paidAt;
        private String paymentMethod;
        private String transactionId;
        private String receiptNo;
        private Long daysLate;
        private Double ratePerDay;
        private String reason;

        public FineBuilder fineId(Long fineId) { this.fineId = fineId; return this; }
        public FineBuilder borrowId(Long borrowId) { this.borrowId = borrowId; return this; }
        public FineBuilder userId(Long userId) { this.userId = userId; return this; }
        public FineBuilder userName(String userName) { this.userName = userName; return this; }
        public FineBuilder bookTitle(String bookTitle) { this.bookTitle = bookTitle; return this; }
        public FineBuilder amount(Double amount) { this.amount = amount; return this; }
        public FineBuilder status(FineStatus status) { this.status = status; return this; }
        public FineBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public FineBuilder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
        public FineBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public FineBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public FineBuilder receiptNo(String receiptNo) { this.receiptNo = receiptNo; return this; }
        public FineBuilder daysLate(Long daysLate) { this.daysLate = daysLate; return this; }
        public FineBuilder ratePerDay(Double ratePerDay) { this.ratePerDay = ratePerDay; return this; }
        public FineBuilder reason(String reason) { this.reason = reason; return this; }

        public Fine build() {
            return new Fine(fineId, borrowId, userId, userName, bookTitle, amount, status, createdAt, paidAt, paymentMethod, transactionId, receiptNo, daysLate, ratePerDay, reason);
        }
    }

    public Long getFineId() { return fineId; }
    public void setFineId(Long fineId) { this.fineId = fineId; }

    public Long getBorrowId() { return borrowId; }
    public void setBorrowId(Long borrowId) { this.borrowId = borrowId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public FineStatus getStatus() { return status; }
    public void setStatus(FineStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }

    public Long getDaysLate() { return daysLate; }
    public void setDaysLate(Long daysLate) { this.daysLate = daysLate; }

    public Double getRatePerDay() { return ratePerDay; }
    public void setRatePerDay(Double ratePerDay) { this.ratePerDay = ratePerDay; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}