package com.bookhive.borrowservice.dto;

public class BorrowRequest {
    private Long userId;
    private Long bookId;
    private String userName;
    private String bookTitle;
    private Integer loanDays;

    public BorrowRequest() {}

    public BorrowRequest(Long userId, Long bookId, String userName, String bookTitle, Integer loanDays) {
        this.userId = userId;
        this.bookId = bookId;
        this.userName = userName;
        this.bookTitle = bookTitle;
        this.loanDays = loanDays;
    }

    public static BorrowRequestBuilder builder() {
        return new BorrowRequestBuilder();
    }

    public static class BorrowRequestBuilder {
        private Long userId;
        private Long bookId;
        private String userName;
        private String bookTitle;
        private Integer loanDays;

        public BorrowRequestBuilder userId(Long userId) { this.userId = userId; return this; }
        public BorrowRequestBuilder bookId(Long bookId) { this.bookId = bookId; return this; }
        public BorrowRequestBuilder userName(String userName) { this.userName = userName; return this; }
        public BorrowRequestBuilder bookTitle(String bookTitle) { this.bookTitle = bookTitle; return this; }
        public BorrowRequestBuilder loanDays(Integer loanDays) { this.loanDays = loanDays; return this; }

        public BorrowRequest build() {
            return new BorrowRequest(userId, bookId, userName, bookTitle, loanDays);
        }
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public Integer getLoanDays() { return loanDays; }
    public void setLoanDays(Integer loanDays) { this.loanDays = loanDays; }
}