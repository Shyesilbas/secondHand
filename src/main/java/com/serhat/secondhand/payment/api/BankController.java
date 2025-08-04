package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.dto.BankRequest;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.service.IBankService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/bank")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bank Management", description = "Bank account operations")
public class BankController {

    private final IBankService bankService;
    private final IUserService userService;

    @Operation(summary = "Get current user's bank account information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank account information retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/account")
    public ResponseEntity<BankDto> getBankAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        BankDto bankDto = bankService.getBankInfo(user);
        return ResponseEntity.ok(bankDto);
    }

    @Operation(summary = "Create a new bank account for current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Bank account created successfully"),
        @ApiResponse(responseCode = "409", description = "User already has a bank account"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/account")
    public ResponseEntity<Bank> createBankAccount(@RequestBody BankRequest bankRequest) {
        Bank createdBank = bankService.createBank(bankRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBank);
    }

    @Operation(summary = "Check if current user has a bank account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/account/exists")
    public ResponseEntity<Boolean> hasBankAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        boolean hasAccount = bankService.hasUserBankAccount(user);
        return ResponseEntity.ok(hasAccount);
    }

    @Operation(summary = "Get current user's bank balance")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Balance retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getBankBalance() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        Bank bank = bankService.findByUser(user);
        return ResponseEntity.ok(bank.getBalance());
    }

    @Operation(summary = "Get current user's IBAN")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IBAN retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Bank account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/iban")
    public ResponseEntity<String> getBankIban() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        Bank bank = bankService.findByUser(user);
        return ResponseEntity.ok(bank.getIBAN());
    }
}