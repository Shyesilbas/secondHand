package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.service.ICreditCardService;
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

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/creditcard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Management", description = "Credit card operations for users")
public class CreditCardController {

    private final ICreditCardService creditCardService;

    @Operation(summary = "Create a new credit card for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Credit card created successfully"),
        @ApiResponse(responseCode = "409", description = "User already has a credit card"),
        @ApiResponse(responseCode = "400", description = "Invalid credit card data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<CreditCardDto> createCreditCard(
            @RequestBody CreditCardRequest creditCardRequest,
            Authentication authentication) {
        log.info("Creating credit card for user: {}", authentication.getName());
        CreditCardDto createdCard = creditCardService.createCreditCard(creditCardRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }

    @Operation(summary = "Get current user's credit card information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credit card information retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Credit card not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<CreditCardDto> getCreditCard(Authentication authentication) {
        log.info("Getting credit card for user: {}", authentication.getName());
        CreditCardDto creditCardDto = creditCardService.getUserCreditCard(authentication);
        return ResponseEntity.ok(creditCardDto);
    }

    @Operation(summary = "Validate a credit card")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed"),
        @ApiResponse(responseCode = "400", description = "Invalid credit card data")
    })
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCreditCard(
            @RequestBody CreditCardDto creditCardDto) {
        log.debug("Validating credit card");
        Map<String, Object> response = creditCardService.validateCreditCardRequest(creditCardDto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Check if current user has a credit card")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> hasCreditCard(Authentication authentication) {
        log.info("Checking credit card existence for user: {}", authentication.getName());
        Map<String, Object> response = creditCardService.checkCreditCardExists(authentication);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Check available credit for current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available credit retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Credit card not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/available-credit")
    public ResponseEntity<Map<String, Object>> getAvailableCredit(
            @RequestParam(required = false) BigDecimal requestedAmount,
            Authentication authentication) {
        log.info("Getting available credit for user: {}", authentication.getName());
        Map<String, Object> response = creditCardService.getAvailableCredit(requestedAmount, authentication);
        return ResponseEntity.ok(response);
    }
}