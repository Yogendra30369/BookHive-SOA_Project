package com.bookhive.fineservice.dto;

public class FineRequest {
    private Long borrowId;
    private Long userId;
    private String userName;
    private String bookTitle;
    private Double amount;
    private Long daysLate;
    private Double ratePerDay;
    private String reason;

    public FineRequest() {}

    public FineRequest(Long borrowId, Long userId, String userName, String bookTitle, Double amount, Long daysLate, Double ratePerDay, String reason) {
        this.borrowId = borrowId;
        this.userId = userId;
        this.userName = userName;
        this.bookTitle = bookTitle;
        this.amount = amount;
        this.daysLate = daysLate;
        this.ratePerDay = ratePerDay;
        this.reason = reason;
    }

    public static FineRequestBuilder builder() {
        return new FineRequestBuilder();
    }

    public static class FineRequestBuilder {
        private Long borrowId;
        private Long userId;
        private String userName;
        private String bookTitle;
        private Double amount;
        private Long daysLate;
        private Double ratePerDay;
        private String reason;

        public FineRequestBuilder borrowId(Long borrowId) { this.borrowId = borrowId; return this; }
        public FineRequestBuilder userId(Long userId) { this.userId = userId; return this; }
        public FineRequestBuilder userName(String userName) { this.userName = userName; return this; }
        public FineRequestBuilder bookTitle(String bookTitle) { this.bookTitle = bookTitle; return this; }
        public FineRequestBuilder amount(Double amount) { this.amount = amount; return this; }
        public FineRequestBuilder daysLate(Long daysLate) { this.daysLate = daysLate; return this; }
        public FineRequestBuilder ratePerDay(Double ratePerDay) { this.ratePerDay = ratePerDay; return this; }
        public FineRequestBuilder reason(String reason) { this.reason = reason; return this; }

        public FineRequest build() {
            return new FineRequest(borrowId, userId, userName, bookTitle, amount, daysLate, ratePerDay, reason);
        }
    }

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

    public Long getDaysLate() { return daysLate; }
    public void setDaysLate(Long daysLate) { this.daysLate = daysLate; }

    public Double getRatePerDay() { return ratePerDay; }
    public void setRatePerDay(Double ratePerDay) { this.ratePerDay = ratePerDay; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}