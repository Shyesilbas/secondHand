package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.service.BankService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/bank")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bank Account Management", description = "Bank account operations for users")
public class BankController {

    private final BankService bankService;


    @GetMapping
    public ResponseEntity<BankDto> getBankAccount(Authentication authentication) {
        log.info("Getting bank account for user: {}", authentication.getName());
        BankDto bankDto = bankService.getBankInfo(authentication);
        return ResponseEntity.ok(bankDto);
    }


    @PostMapping
    public ResponseEntity<BankDto> createBankAccount(Authentication authentication) {
        log.info("Creating bank account for user: {}", authentication.getName());
        BankDto bankDto = bankService.createBankAccount(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(bankDto);
    }

    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkBankAccountExists(Authentication authentication) {
        log.info("Checking bank account existence for user: {}", authentication.getName());
        Map<String, Object> response = bankService.checkBankAccountExists(authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBankBalance(Authentication authentication) {
        log.info("Getting bank balance for user: {}", authentication.getName());
        Map<String, Object> response = bankService.getBankBalance(authentication);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteBankAccount(Authentication authentication) {
        log.info("Deleting bank account for user: {}", authentication.getName());
        bankService.deleteBankAccount(authentication);
        return ResponseEntity.noContent().build();
    }

}
