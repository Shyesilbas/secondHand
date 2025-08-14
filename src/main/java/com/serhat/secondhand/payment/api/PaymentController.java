package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.service.PaymentService;
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

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<PaymentDto> createPayment(@RequestBody PaymentRequest paymentRequest, Authentication authentication) {
        log.info("Creating payment from user {} with request: {}", authentication.getName(), paymentRequest);
        PaymentDto paymentDto = paymentService.createPayment(paymentRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentDto);
    }

    @PostMapping("/listings/pay-fee")
    public ResponseEntity<PaymentDto> payListingCreationFee(
            @RequestBody ListingFeePaymentRequest listingFeePaymentRequest,
            Authentication authentication) {
        log.info("Processing listing fee payment for listing {} by user {}", listingFeePaymentRequest.listingId(), authentication.getName());
        PaymentDto paymentDto = paymentService.createListingFeePayment(listingFeePaymentRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentDto);
    }


    @GetMapping("/my-payments")
    public ResponseEntity<Page<PaymentDto>> getMyPayments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting paginated payments for user: {}", authentication.getName());
        Page<PaymentDto> payments = paymentService.getMyPayments(authentication, page, size);
        return ResponseEntity.ok(payments);
    }


    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(Authentication authentication) {
        log.info("Getting payment statistics for user: {}", authentication.getName());
        Map<String, Object> statistics = paymentService.getPaymentStatistics(authentication);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/listing-fee-config")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        log.info("Getting listing fee configuration");
        ListingFeeConfigDto config = paymentService.getListingFeeConfig();
        return ResponseEntity.ok(config);
    }
}
