package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.IPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "Payment processing operations")
public class PaymentController {

    private final IPaymentService paymentService;

    @Operation(summary = "Create a new payment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Payment created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payment data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "402", description = "Payment required - insufficient funds"),
        @ApiResponse(responseCode = "404", description = "User or listing not found")
    })
    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(
            @RequestBody PaymentRequest paymentRequest,
            Authentication authentication) {
        log.info("Creating payment for listing: {} by user: {}", 
                 paymentRequest.listingId(), authentication.getName());
        
        PaymentDto createdPayment = paymentService.createPayment(paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    @Operation(summary = "Get all payments for current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments(Authentication authentication) {
        log.info("Getting all payments for user: {}", authentication.getName());
        List<PaymentDto> payments = paymentService.getPayments();
        return ResponseEntity.ok(payments);
    }

    @Operation(summary = "Get payments with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getPaymentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "processedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        
        log.info("Getting paginated payments for user: {} - page: {}, size: {}", 
                 authentication.getName(), page, size);
        
        Map<String, Object> response = paymentService.getPaymentsPaginated(page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payment statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(Authentication authentication) {
        log.info("Getting payment statistics for user: {}", authentication.getName());
        Map<String, Object> statistics = paymentService.getPaymentStatistics();
        return ResponseEntity.ok(statistics);
    }

    @Operation(summary = "Get supported payment types")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment types retrieved successfully")
    })
    @GetMapping("/types")
    public ResponseEntity<PaymentType[]> getPaymentTypes() {
        return ResponseEntity.ok(PaymentType.values());
    }

    @Operation(summary = "Check if user can make payments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/can-pay")
    public ResponseEntity<Map<String, Object>> canUserMakePayments(Authentication authentication) {
        log.info("Checking payment capability for user: {}", authentication.getName());
        Map<String, Object> response = paymentService.checkUserPaymentCapability(authentication);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Validate payment request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed"),
        @ApiResponse(responseCode = "400", description = "Invalid payment data")
    })
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePaymentRequest(
            @RequestBody PaymentRequest paymentRequest) {
        log.debug("Validating payment request for listing: {}", paymentRequest.listingId());
        Map<String, Object> response = paymentService.validatePaymentRequest(paymentRequest);
        return ResponseEntity.ok(response);
    }
}