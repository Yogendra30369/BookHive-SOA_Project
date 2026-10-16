package com.bookhive.bookservice.service;

import com.bookhive.bookservice.dto.BookRequest;
import com.bookhive.bookservice.model.Book;
import com.bookhive.bookservice.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    @Autowired
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.searchByKeyword(keyword);
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    public Book addBook(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .type(request.getType())
                .category(request.getCategory())
                .isbn(request.getIsbn())
                .publisher(request.getPublisher())
                .year(request.getYear())
                .cover(request.getCover())
                .description(request.getDescription())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getAvailableCopies())
                .build();
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, BookRequest request) {
        Book book = getBookById(id);
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setType(request.getType());
        book.setCategory(request.getCategory());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setYear(request.getYear());
        book.setCover(request.getCover());
        book.setDescription(request.getDescription());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    // Called by Borrow Service to reduce available copies
    public Book decrementCopy(Long bookId) {
        Book book = getBookById(bookId);
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for book: " + bookId);
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        return bookRepository.save(book);
    }

    // Called by Borrow Service when book is returned
    public Book incrementCopy(Long bookId) {
        Book book = getBookById(bookId);
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        return bookRepository.save(book);
    }
}
