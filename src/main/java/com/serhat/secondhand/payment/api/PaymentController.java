package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.IPaymentVerificationService;
import com.serhat.secondhand.payment.service.ListingFeeService;
import com.serhat.secondhand.payment.service.PaymentProcessor;
import com.serhat.secondhand.payment.service.PaymentStatsService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/pay")
    @Operation(summary = "Create a new payment", description = "Processes a general payment request using idempotency for safety.")
    public ResponseEntity<?> createPayment(
            @RequestBody PaymentRequest paymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal User currentUser) {

        log.info("Creating payment for user ID {} with request: {}", currentUser.getId(), paymentRequest);
        PaymentRequest requestWithKey = mergeIdempotencyKey(paymentRequest, idempotencyKey);

        Result<PaymentDto> result = paymentProcessor.executeSinglePayment(currentUser.getId(), requestWithKey);

        return handleResult(result, HttpStatus.CREATED);
    }

    @PostMapping("/initiate-verification")
    @Operation(summary = "Initiate payment verification", description = "Starts the verification process (e.g., OTP) for a payment.")
    public ResponseEntity<Void> initiatePaymentVerification(
            @RequestBody(required = false) com.serhat.secondhand.payment.dto.InitiateVerificationRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Initiating payment verification for user ID: {}", currentUser.getId());
        paymentVerificationService.initiatePaymentVerification(currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listings/pay-fee")
    @Operation(summary = "Pay listing creation fee", description = "Processes payment for listing creation fees.")
    public ResponseEntity<?> payListingCreationFee(
            @RequestBody ListingFeePaymentRequest listingFeePaymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal User currentUser) {

        log.info("Processing listing fee payment for listing {} by user ID {}",
                listingFeePaymentRequest.listingId(), currentUser.getId());

        ListingFeePaymentRequest requestWithKey = mergeIdempotencyKeyForListingFee(listingFeePaymentRequest, idempotencyKey);
        Result<PaymentDto> result = listingFeeService.payListingCreationFee(currentUser.getId(), requestWithKey);

        return handleResult(result, HttpStatus.CREATED);
    }

    @GetMapping("/my-payments")
    @Operation(summary = "Get user payments", description = "Retrieve paginated and filtered history of payments for the authenticated user.")
    public ResponseEntity<Page<PaymentDto>> getMyPayments(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) com.serhat.secondhand.payment.entity.PaymentTransactionType transactionType,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) com.serhat.secondhand.payment.entity.PaymentDirection paymentDirection,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") java.time.LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") java.time.LocalDateTime dateTo,
            @RequestParam(required = false) java.math.BigDecimal amountMin,
            @RequestParam(required = false) java.math.BigDecimal amountMax,
            @RequestParam(required = false) String sellerName) {

        java.time.LocalDateTime dateToEndOfDay = dateTo != null ? dateTo.with(java.time.LocalTime.MAX) : null;

        Page<PaymentDto> payments = paymentStatsService.getMyPayments(
                currentUser.getId(), page, size,
                transactionType, paymentType, paymentDirection,
                dateFrom, dateToEndOfDay, amountMin, amountMax, sellerName);

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(name = "paymentType", required = false) String paymentType) {

        if (paymentType == null || paymentType.isBlank()) {
            return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(currentUser.getId()));
        }

        return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(
                currentUser.getId(), PaymentType.valueOf(paymentType)));
    }

    @GetMapping("/listing-fee-config")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        return ResponseEntity.ok(listingFeeService.getListingFeeConfig());
    }

    private ResponseEntity<?> handleResult(Result<?> result, HttpStatus successStatus) {
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.status(successStatus).body(result.getData());
    }

    private PaymentRequest mergeIdempotencyKey(PaymentRequest paymentRequest, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank() &&
                (paymentRequest.idempotencyKey() == null || paymentRequest.idempotencyKey().isBlank())) {
            return PaymentRequest.builder()
                    .fromUserId(paymentRequest.fromUserId())
                    .toUserId(paymentRequest.toUserId())
                    .receiverName(paymentRequest.receiverName())
                    .receiverSurname(paymentRequest.receiverSurname())
                    .listingId(paymentRequest.listingId())
                    .amount(paymentRequest.amount())
                    .paymentType(paymentRequest.paymentType())
                    .transactionType(paymentRequest.transactionType())
                    .paymentDirection(paymentRequest.paymentDirection())
                    .verificationCode(paymentRequest.verificationCode())
                    .agreementsAccepted(paymentRequest.agreementsAccepted())
                    .acceptedAgreementIds(paymentRequest.acceptedAgreementIds())
                    .idempotencyKey(idempotencyKey)
                    .build();
        }
        return paymentRequest;
    }

    private ListingFeePaymentRequest mergeIdempotencyKeyForListingFee(ListingFeePaymentRequest request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank() &&
                (request.idempotencyKey() == null || request.idempotencyKey().isBlank())) {
            return new ListingFeePaymentRequest(
                    request.paymentType(),
                    request.listingId(),
                    request.verificationCode(),
                    request.agreementsAccepted(),
                    request.acceptedAgreementIds(),
                    idempotencyKey
            );
        }
        return request;
    }
}