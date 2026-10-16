package com.bookhive.bookservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String category;
    private String type;
    private String isbn;
    private String publisher;
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String cover;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer totalCopies;

    @Column(nullable = false)
    private Integer availableCopies;

    public Book() {}

    public Book(Long bookId, String title, String author, String type, String category, String isbn, String publisher, Integer year, String cover, String description, Integer totalCopies, Integer availableCopies) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.type = type;
        this.category = category;
        this.isbn = isbn;
        this.publisher = publisher;
        this.year = year;
        this.cover = cover;
        this.description = description;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
    }

    public static BookBuilder builder() {
        return new BookBuilder();
    }

    public static class BookBuilder {
        private Long bookId;
        private String title;
        private String author;
        private String type;
        private String category;
        private String isbn;
        private String publisher;
        private Integer year;
        private String cover;
        private String description;
        private Integer totalCopies;
        private Integer availableCopies;

        public BookBuilder bookId(Long bookId) { this.bookId = bookId; return this; }
        public BookBuilder title(String title) { this.title = title; return this; }
        public BookBuilder author(String author) { this.author = author; return this; }
        public BookBuilder type(String type) { this.type = type; return this; }
        public BookBuilder category(String category) { this.category = category; return this; }
        public BookBuilder isbn(String isbn) { this.isbn = isbn; return this; }
        public BookBuilder publisher(String publisher) { this.publisher = publisher; return this; }
        public BookBuilder year(Integer year) { this.year = year; return this; }
        public BookBuilder cover(String cover) { this.cover = cover; return this; }
        public BookBuilder description(String description) { this.description = description; return this; }
        public BookBuilder totalCopies(Integer totalCopies) { this.totalCopies = totalCopies; return this; }
        public BookBuilder availableCopies(Integer availableCopies) { this.availableCopies = availableCopies; return this; }

        public Book build() {
            return new Book(bookId, title, author, type, category, isbn, publisher, year, cover, description, totalCopies, availableCopies);
        }
    }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getCover() { return cover; }
    public void setCover(String cover) { this.cover = cover; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getTotalCopies() { return totalCopies; }
    public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

    public Integer getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }
}