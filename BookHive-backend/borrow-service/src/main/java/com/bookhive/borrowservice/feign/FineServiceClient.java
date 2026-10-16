package com.bookhive.borrowservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "fine-service")
public interface FineServiceClient {

    @PostMapping("/api/fines/create")
    ResponseEntity<?> createFine(@RequestBody Map<String, Object> fineRequest);
}