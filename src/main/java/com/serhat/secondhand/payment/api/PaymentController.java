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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
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
        @ApiResponse(responseCode = "402", description = "Payment required - insufficient funds"),
        @ApiResponse(responseCode = "404", description = "User or listing not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(@RequestBody PaymentRequest paymentRequest) {
        log.info("Creating payment for listing: {} with amount: {}", 
                 paymentRequest.listingId(), paymentRequest.amount());
        
        PaymentDto createdPayment = paymentService.createPayment(paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    @Operation(summary = "Get all payments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
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
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<PaymentDto> payments = paymentService.getPayments();
        
        // Manual pagination since repository doesn't return Page
        int start = Math.min((int) pageable.getOffset(), payments.size());
        int end = Math.min((start + pageable.getPageSize()), payments.size());
        List<PaymentDto> pageContent = payments.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("totalElements", payments.size());
        response.put("totalPages", (int) Math.ceil((double) payments.size() / size));
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("hasNext", end < payments.size());
        response.put("hasPrevious", start > 0);
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payment statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        List<PaymentDto> payments = paymentService.getPayments();
        
        long totalPayments = payments.size();
        long successfulPayments = payments.stream().mapToLong(p -> p.isSuccess() ? 1 : 0).sum();
        long failedPayments = totalPayments - successfulPayments;
        
        BigDecimal totalAmount = payments.stream()
                .filter(PaymentDto::isSuccess)
                .map(PaymentDto::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long creditCardPayments = payments.stream()
                .mapToLong(p -> p.paymentType() == PaymentType.CREDIT_CARD ? 1 : 0).sum();
        
        long transferPayments = payments.stream()
                .mapToLong(p -> p.paymentType() == PaymentType.TRANSFER ? 1 : 0).sum();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalPayments", totalPayments);
        statistics.put("successfulPayments", successfulPayments);
        statistics.put("failedPayments", failedPayments);
        statistics.put("successRate", totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0);
        statistics.put("totalAmount", totalAmount);
        statistics.put("creditCardPayments", creditCardPayments);
        statistics.put("transferPayments", transferPayments);
        
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
    public ResponseEntity<Map<String, Object>> canUserMakePayments() {
        // Check if user has at least one payment method
        boolean hasBankAccount = false;
        boolean hasCreditCard = false;
        
        try {
            // Note: These methods should be added to user service or accessed differently
            // For now, using basic logic
            hasBankAccount = true; // Assume user has bank account for now
            hasCreditCard = true;  // Assume user has credit card for now
        } catch (Exception e) {
            log.warn("Error checking user payment methods: {}", e.getMessage());
        }
        
        boolean canPay = hasBankAccount || hasCreditCard;
        
        Map<String, Object> response = new HashMap<>();
        response.put("canMakePayments", canPay);
        response.put("hasBankAccount", hasBankAccount);
        response.put("hasCreditCard", hasCreditCard);
        response.put("availablePaymentTypes", canPay ? PaymentType.values() : new PaymentType[]{});
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Validate payment request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed"),
        @ApiResponse(responseCode = "400", description = "Invalid payment data")
    })
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePaymentRequest(@RequestBody PaymentRequest paymentRequest) {
        Map<String, Object> response = new HashMap<>();
        
        // Basic validation
        boolean isValid = true;
        String message = "Payment request is valid";
        
        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            isValid = false;
            message = "Amount must be greater than zero";
        } else if (paymentRequest.toUserId() == null) {
            isValid = false;
            message = "Recipient user ID is required";
        } else if (paymentRequest.paymentType() == null) {
            isValid = false;
            message = "Payment type is required";
        } else if (paymentRequest.paymentType() == PaymentType.CREDIT_CARD && paymentRequest.creditCard() == null) {
            isValid = false;
            message = "Credit card information is required for credit card payments";
        }
        
        response.put("valid", isValid);
        response.put("message", message);
        response.put("amount", paymentRequest.amount());
        response.put("paymentType", paymentRequest.paymentType());
        
        return ResponseEntity.ok(response);
    }
}