package com.bookhive.borrowservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrows")
public class Borrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long borrowId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long bookId;

    private String bookTitle;
    private String userName;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate returnDate;

    private LocalDate actualReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status;

    public enum BorrowStatus {
        RESERVED, ACTIVE, RETURNED, OVERDUE
    }

    public Borrow() {}

    public Borrow(Long borrowId, Long userId, Long bookId, String bookTitle, String userName, LocalDate issueDate, LocalDate returnDate, LocalDate actualReturnDate, BorrowStatus status) {
        this.borrowId = borrowId;
        this.userId = userId;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.userName = userName;
        this.issueDate = issueDate;
        this.returnDate = returnDate;
        this.actualReturnDate = actualReturnDate;
        this.status = status;
    }

    public static BorrowBuilder builder() {
        return new BorrowBuilder();
    }

    public static class BorrowBuilder {
        private Long borrowId;
        private Long userId;
        private Long bookId;
        private String bookTitle;
        private String userName;
        private LocalDate issueDate;
        private LocalDate returnDate;
        private LocalDate actualReturnDate;
        private BorrowStatus status;

        public BorrowBuilder borrowId(Long borrowId) { this.borrowId = borrowId; return this; }
        public BorrowBuilder userId(Long userId) { this.userId = userId; return this; }
        public BorrowBuilder bookId(Long bookId) { this.bookId = bookId; return this; }
        public BorrowBuilder bookTitle(String bookTitle) { this.bookTitle = bookTitle; return this; }
        public BorrowBuilder userName(String userName) { this.userName = userName; return this; }
        public BorrowBuilder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public BorrowBuilder returnDate(LocalDate returnDate) { this.returnDate = returnDate; return this; }
        public BorrowBuilder actualReturnDate(LocalDate actualReturnDate) { this.actualReturnDate = actualReturnDate; return this; }
        public BorrowBuilder status(BorrowStatus status) { this.status = status; return this; }

        public Borrow build() {
            return new Borrow(borrowId, userId, bookId, bookTitle, userName, issueDate, returnDate, actualReturnDate, status);
        }
    }

    public Long getBorrowId() { return borrowId; }
    public void setBorrowId(Long borrowId) { this.borrowId = borrowId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public LocalDate getActualReturnDate() { return actualReturnDate; }
    public void setActualReturnDate(LocalDate actualReturnDate) { this.actualReturnDate = actualReturnDate; }

    public BorrowStatus getStatus() { return status; }
    public void setStatus(BorrowStatus status) { this.status = status; }
}