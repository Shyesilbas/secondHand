package com.serhat.secondhand.ewallet.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.payment.application.PaymentStatsService;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentFilter;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ewallet")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "E Wallet", description = "E Wallet operations")
public class EWalletController {

    private final IEWalletService eWalletService;
    private final PaymentStatsService paymentStatsService;

    @PostMapping
    public ResponseEntity<?> createEWallet(@RequestBody EwalletRequest request) {
        log.info("Creating eWallet for authenticated user");
        EWalletDto eWallet = eWalletService.createEWallet(request);
        return ResultResponses.ok(Result.success(eWallet));
    }

    @GetMapping
    public ResponseEntity<?> getEWallet() {
        log.debug("Getting eWallet for authenticated user");
        EWalletDto eWallet = eWalletService.getEWalletByUserId();
        return ResultResponses.ok(Result.success(eWallet));
    }

    @PutMapping("/update/spendingWarning")
    public ResponseEntity<?> updateSpendingWarning(@RequestBody BigDecimal newSpendingWarning){
        eWalletService.updateSpendingWarningLimit(newSpendingWarning);
        return ResultResponses.ok(Result.success());
    }

    @DeleteMapping("/update/spendingWarning")
    public ResponseEntity<?> removeSpendingWarning(){
        eWalletService.removeSpendingWarningLimit();
        return ResultResponses.ok(Result.success());
    }

    @PutMapping("/limits")
    public ResponseEntity<?> updateLimits(
            @RequestBody UpdateLimitRequest request) {
        log.info("Updating limits for authenticated user");
        EWalletDto eWallet = eWalletService.updateLimits(request);
        return ResultResponses.ok(Result.success(eWallet));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(
            @RequestBody DepositRequest request) {

        eWalletService.deposit(request);

        return ResultResponses.ok(Result.success("Deposit successful"));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(
            @RequestBody WithdrawRequest request) {
        log.info("Processing withdrawal for authenticated user");
        eWalletService.withdraw( request);
        return ResultResponses.ok(Result.success("Withdrawal successful"));
    }


    @GetMapping("/balance/check")
    public ResponseEntity<?> checkBalance(
            @RequestParam BigDecimal amount) {
        log.debug("Checking balance for authenticated user");
        boolean hasBalance = eWalletService.hasSufficientBalance(amount);
        return ResultResponses.ok(Result.success(hasBalance));
    }

    @GetMapping("/spending-warning/check")
    public ResponseEntity<?> checkSpendingWarning(
            @RequestParam BigDecimal amount) {
        log.debug("Checking spending warning threshold for authenticated user");
        SpendingWarningCheckResponse response = eWalletService.checkSpendingWarning(amount);
        return ResultResponses.ok(Result.success(response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10, sort = "processedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching eWallet transactions for user: {}", currentUser.getEmail());
        PaymentFilter filter = new PaymentFilter(
                null,
                PaymentType.EWALLET,
                null,
                null,
                null,
                null,
                null,
                null
        );
        Page<PaymentDto> payments = paymentStatsService.getMyPayments(
                currentUser.getId(),
                pageable,
                filter);
        return ResultResponses.ok(Result.success(payments));
    }
}
