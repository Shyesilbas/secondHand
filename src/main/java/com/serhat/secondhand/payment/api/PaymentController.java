package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.payment.dto.*;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.IPaymentVerificationService;
import com.serhat.secondhand.payment.service.ListingFeeService;
import com.serhat.secondhand.payment.service.PaymentProcessor;
import com.serhat.secondhand.payment.service.PaymentStatsService;
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
    private final ListingFeeService listingFeeService;
    private final IPaymentVerificationService paymentVerificationService;
    private final PaymentIdempotencyHelper idempotencyHelper;

    @PostMapping("/pay")
    @Operation(summary = "Create a new payment", description = "Processes a general payment request using idempotency for safety.")
    public ResponseEntity<?> createPayment(
            @Valid @RequestBody PaymentRequest paymentRequest,
            @RequestHeader(value = "Idempotency-Key") String idempotencyKey,
            @AuthenticationPrincipal User currentUser) {

        log.info("Creating payment for user ID {}", currentUser.getId());

        // Helper kullanarak idempotency key'i DTO'ya taşıyoruz
        PaymentRequest finalRequest = idempotencyHelper.withIdempotencyKey(paymentRequest, idempotencyKey);
        Result<PaymentDto> result = paymentProcessor.executeSinglePayment(currentUser.getId(), finalRequest);

        return ResultResponses.created(result);
    }

    @PostMapping("/initiate-verification")
    @Operation(summary = "Initiate payment verification", description = "Starts the verification process (e.g., OTP) for a payment.")
    public ResponseEntity<Void> initiatePaymentVerification(
            @Valid @RequestBody(required = false) InitiateVerificationRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Initiating payment verification for user ID: {}", currentUser.getId());
        paymentVerificationService.initiatePaymentVerification(currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listings/pay-fee")
    @Operation(summary = "Pay listing creation fee", description = "Processes payment for listing creation fees.")
    public ResponseEntity<?> payListingCreationFee(
            @Valid @RequestBody PaymentRequest listingFeePaymentRequest,
            @RequestHeader(value = "Idempotency-Key") String idempotencyKey,
            @AuthenticationPrincipal User currentUser) {

        log.info("Processing listing fee payment for user ID {}", currentUser.getId());

        PaymentRequest finalRequest = idempotencyHelper.withIdempotencyKey(listingFeePaymentRequest, idempotencyKey);
        Result<PaymentDto> result = listingFeeService.payListingCreationFee(currentUser.getId(), finalRequest);

        return ResultResponses.created(result);
    }

    @GetMapping("/my-payments")
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
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(name = "paymentType", required = false) PaymentType paymentType) {

        return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(currentUser.getId(), paymentType));
    }

    @GetMapping("/listing-fee-config")
    @Operation(summary = "Get fee configuration", description = "Retrieves the current listing fee settings.")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        return ResponseEntity.ok(listingFeeService.getListingFeeConfig());
    }
}