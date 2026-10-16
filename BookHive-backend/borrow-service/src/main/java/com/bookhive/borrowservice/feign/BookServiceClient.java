package com.bookhive.borrowservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "book-service")
public interface BookServiceClient {

    @PutMapping("/api/books/{id}/decrement")
    ResponseEntity<?> decrementCopy(@PathVariable("id") Long bookId);

    @PutMapping("/api/books/{id}/increment")
    ResponseEntity<?> incrementCopy(@PathVariable("id") Long bookId);

    @GetMapping("/api/books/{id}")
    ResponseEntity<?> getBook(@PathVariable("id") Long bookId);
}