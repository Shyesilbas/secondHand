package com.serhat.secondhand.ewallet.controller;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.service.EWalletService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ewallet")
@RequiredArgsConstructor
@Slf4j
public class EWalletController {

    private final EWalletService eWalletService;

    @PostMapping
    public ResponseEntity<EWalletDto> createEWallet(Authentication authentication) {
        log.info("Creating eWallet for authenticated user");
        User user = (User) authentication.getPrincipal();
        EWalletDto eWallet = eWalletService.createEWallet(user.getId());
        return ResponseEntity.ok(eWallet);
    }

    @GetMapping
    public ResponseEntity<EWalletDto> getEWallet(Authentication authentication) {
        log.info("Getting eWallet for authenticated user");
        User user = (User) authentication.getPrincipal();
        EWalletDto eWallet = eWalletService.getEWalletByUserId(user.getId());
        return ResponseEntity.ok(eWallet);
    }

    @PutMapping("/limits")
    public ResponseEntity<EWalletDto> updateLimits(
            Authentication authentication,
            @RequestBody UpdateLimitRequest request) {
        log.info("Updating limits for authenticated user");
        User user = (User) authentication.getPrincipal();
        EWalletDto eWallet = eWalletService.updateLimits(user.getId(), request);
        return ResponseEntity.ok(eWallet);
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(
            Authentication authentication,
            @RequestBody DepositRequest request) {
        log.info("Processing deposit for authenticated user");
        User user = (User) authentication.getPrincipal();
        eWalletService.deposit(user.getId(), request, authentication);
        return ResponseEntity.ok("Deposit successful");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            Authentication authentication,
            @RequestBody WithdrawRequest request) {
        log.info("Processing withdrawal for authenticated user");
        User user = (User) authentication.getPrincipal();
        eWalletService.withdraw(user.getId(), request, authentication);
        return ResponseEntity.ok("Withdrawal successful");
    }


    @GetMapping("/balance/check")
    public ResponseEntity<Boolean> checkBalance(
            Authentication authentication,
            @RequestParam BigDecimal amount) {
        log.info("Checking balance for authenticated user");
        User user = (User) authentication.getPrincipal();
        boolean hasBalance = eWalletService.hasSufficientBalance(user.getId(), amount);
        return ResponseEntity.ok(hasBalance);
    }
}
