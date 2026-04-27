package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.payment.application.IPaymentVerificationService;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentStatsService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentFilter;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
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

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "Payment processing operations")
public class PaymentController {

    private final PaymentProcessor paymentProcessor;
    private final PaymentStatsService paymentStatsService;
    private final IPaymentVerificationService paymentVerificationService;
    private final PaymentIdempotencyHelper idempotencyHelper;

    @PostMapping("/pay")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new payment", description = "Processes a general payment request using idempotency for safety.")
    public ResponseEntity<?> createPayment(
            @Valid @RequestBody PaymentRequest paymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal User currentUser) {

        log.info("Creating payment for user ID {}", currentUser.getId());

        PaymentRequest finalRequest = idempotencyHelper.withIdempotencyKey(paymentRequest, idempotencyKey);
        Result<PaymentDto> result = paymentProcessor.executeSinglePayment(currentUser.getId(), finalRequest);

        return ResultResponses.created(result);
    }

    @PostMapping("/initiate-verification")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Initiate payment verification", description = "Starts the verification process (e.g., OTP) for a payment.")
    public ResponseEntity<Void> initiatePaymentVerification(
            @Valid @RequestBody(required = false) InitiateVerificationRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Initiating payment verification for user ID: {}", currentUser.getId());
        paymentVerificationService.initiatePaymentVerification(currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-payments")
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
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(name = "paymentType", required = false) PaymentType paymentType) {

        return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(currentUser.getId(), paymentType));
    }

}