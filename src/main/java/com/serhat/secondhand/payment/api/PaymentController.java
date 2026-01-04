package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.ListingFeeService;
import com.serhat.secondhand.payment.service.PaymentProcessor;
import com.serhat.secondhand.payment.service.PaymentStatsService;
import com.serhat.secondhand.payment.service.PaymentVerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final PaymentVerificationService paymentVerificationService;

    @PostMapping("/pay")
    public ResponseEntity<PaymentDto> createPayment(
            @RequestBody PaymentRequest paymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication) {
        log.info("Creating payment from user {} with request: {}", authentication.getName(), paymentRequest);
        PaymentRequest requestWithKey = mergeIdempotencyKey(paymentRequest, idempotencyKey);
        PaymentDto paymentDto = paymentProcessor.process(requestWithKey, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentDto);
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

    @PostMapping("/initiate-verification")
    public ResponseEntity<Void> initiatePaymentVerification(@RequestBody(required = false) com.serhat.secondhand.payment.dto.InitiateVerificationRequest request, Authentication authentication) {
        log.info("Received initiate payment verification request from user: {}, request: {}", authentication.getName(), request);
        try {
            paymentVerificationService.initiatePaymentVerification(authentication, request);
            log.info("Payment verification initiated successfully for user: {}", authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error initiating payment verification for user: {}, error: {}", authentication.getName(), e.getMessage(), e);
            throw e;
        }
    }


    @PostMapping("/listings/pay-fee")
    public ResponseEntity<PaymentDto> payListingCreationFee(
            @RequestBody ListingFeePaymentRequest listingFeePaymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication) {
        log.info("Processing listing fee payment for listing {} by user {}", listingFeePaymentRequest.listingId(), authentication.getName());
        ListingFeePaymentRequest requestWithKey = mergeIdempotencyKeyForListingFee(listingFeePaymentRequest, idempotencyKey);
        PaymentDto paymentDto = listingFeeService.payListingCreationFee(requestWithKey, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentDto);
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


    @GetMapping("/my-payments")
    public ResponseEntity<Page<PaymentDto>> getMyPayments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting paginated payments for user: {}", authentication.getName());
        Page<PaymentDto> payments = paymentStatsService.getMyPayments(authentication, page, size);
        return ResponseEntity.ok(payments);
    }


    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(Authentication authentication,
                                                                    @RequestParam(name = "paymentType", required = false) String paymentType) {
        log.info("Getting payment statistics for user: {}", authentication.getName());
        if (paymentType == null || paymentType.isBlank()) {
            return ResponseEntity.ok(paymentStatsService.getPaymentStatistics(authentication));
        }
        Map<String, Object> statistics = paymentStatsService.getPaymentStatistics(authentication, PaymentType.valueOf(paymentType));
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/listing-fee-config")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        log.info("Getting listing fee configuration");
        ListingFeeConfigDto config = listingFeeService.getListingFeeConfig();
        return ResponseEntity.ok(config);
    }
}
