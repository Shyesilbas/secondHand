package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.dto.BankRequest;
import com.serhat.secondhand.payment.service.IBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    private final IBankService bankService;

    @Operation(summary = "Get current user's bank account information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank account information retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<BankDto> getBankAccount(Authentication authentication) {
        log.info("Getting bank account for user: {}", authentication.getName());
        BankDto bankDto = bankService.getBankAccountInfo(authentication);
        return ResponseEntity.ok(bankDto);
    }

    @Operation(summary = "Create a new bank account for current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Bank account created successfully"),
        @ApiResponse(responseCode = "409", description = "User already has a bank account"),
        @ApiResponse(responseCode = "400", description = "Invalid bank account data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<BankDto> createBankAccount(
            @RequestBody BankRequest bankRequest,
            Authentication authentication) {
        log.info("Creating bank account for user: {}", authentication.getName());
        BankDto bankDto = bankService.createBankAccount(bankRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(bankDto);
    }

    @Operation(summary = "Check if current user has a bank account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> hasBankAccount(Authentication authentication) {
        log.info("Checking bank account existence for user: {}", authentication.getName());
        Map<String, Object> response = bankService.checkBankAccountExists(authentication);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current user's bank account balance")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Balance retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBankBalance(Authentication authentication) {
        log.info("Getting bank balance for user: {}", authentication.getName());
        Map<String, Object> response = bankService.getBankBalance(authentication);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current user's IBAN")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IBAN retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/iban")
    public ResponseEntity<Map<String, String>> getBankIban(Authentication authentication) {
        log.info("Getting bank IBAN for user: {}", authentication.getName());
        Map<String, String> response = bankService.getBankIban(authentication);
        return ResponseEntity.ok(response);
    }
}