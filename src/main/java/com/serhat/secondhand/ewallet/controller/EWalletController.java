package com.serhat.secondhand.ewallet.controller;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.service.EWalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ewallet")
@RequiredArgsConstructor
@Slf4j
public class EWalletController {

    private final EWalletService eWalletService;

    @PostMapping
    public ResponseEntity<EWalletDto> createEWallet(@RequestBody EwalletRequest request) {
        log.info("Creating eWallet for authenticated user");
        EWalletDto eWallet = eWalletService.createEWallet(request);
        return ResponseEntity.ok(eWallet);
    }

    @GetMapping
    public ResponseEntity<EWalletDto> getEWallet() {
        log.info("Getting eWallet for authenticated user");
        EWalletDto eWallet = eWalletService.getEWalletByUserId();
        return ResponseEntity.ok(eWallet);
    }

    @PutMapping("/update/spendingWarning")
    public void updateSpendingWarning(@RequestBody BigDecimal newSpendingWarning){
        eWalletService.updateSpendingWarningLimit(newSpendingWarning);
    }

    @DeleteMapping("/update/spendingWarning")
    public void removeSpendingWarning(){
        eWalletService.removeSpendingWarningLimit();
    }

    @PutMapping("/limits")
    public ResponseEntity<EWalletDto> updateLimits(
            @RequestBody UpdateLimitRequest request) {
        log.info("Updating limits for authenticated user");
        EWalletDto eWallet = eWalletService.updateLimits(request);
        return ResponseEntity.ok(eWallet);
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(
            @RequestBody DepositRequest request) {

        eWalletService.deposit(request);

        return ResponseEntity.ok("Deposit successful");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            @RequestBody WithdrawRequest request) {
        log.info("Processing withdrawal for authenticated user");
        eWalletService.withdraw( request);
        return ResponseEntity.ok("Withdrawal successful");
    }


    @GetMapping("/balance/check")
    public ResponseEntity<Boolean> checkBalance(
            @RequestParam BigDecimal amount) {
        log.info("Checking balance for authenticated user");
        boolean hasBalance = eWalletService.hasSufficientBalance(amount);
        return ResponseEntity.ok(hasBalance);
    }
}
