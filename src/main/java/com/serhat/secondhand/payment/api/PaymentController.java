package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.payment.application.IPaymentVerificationService;
import com.serhat.secondhand.payment.application.PaymentStatsService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentFilter;
import com.serhat.secondhand.payment.dto.PaymentStatisticsDto;
import com.serhat.secondhand.payment.dto.PaymentVerificationDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "Payment processing operations")
public class PaymentController {

    private final PaymentStatsService paymentStatsService;
    private final IPaymentVerificationService paymentVerificationService;

    @PostMapping("/initiate-verification")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Initiate payment verification", description = "Starts the verification process (e.g., OTP) for a payment.")
    public ResponseEntity<PaymentVerificationDto> initiatePaymentVerification(
            @Valid @RequestBody(required = false) InitiateVerificationRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Initiating payment verification for user ID: {}", currentUser.getId());
        return ResponseEntity.ok(paymentVerificationService.initiatePaymentVerification(currentUser.getId(), request));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user payments", description = "Retrieve paginated and filtered history of payments.")
    public ResponseEntity<Page<PaymentDto>> getMyPayments(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10, sort = "processedAt", direction = Sort.Direction.DESC) Pageable pageable,
            PaymentFilter filter) {

        log.info("Fetching payments for user: {} with filters: {}", currentUser.getEmail(), filter);

        Page<PaymentDto> payments = paymentStatsService.getMyPayments(
                currentUser.getId(),
                pageable,
                filter);

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentStatisticsDto> getPaymentStatistics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(name = "providerName", required = false) String providerName) {

        return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(currentUser.getId(), providerName));
    }

}