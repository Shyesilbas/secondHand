package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.service.ICreditCardService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/creditcard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Management", description = "Credit card operations")
public class CreditCardController {

    private final ICreditCardService creditCardService;
    private final IUserService userService;

    @Operation(summary = "Create a new credit card for current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Credit card created successfully"),
        @ApiResponse(responseCode = "409", description = "User already has a credit card"),
        @ApiResponse(responseCode = "400", description = "Invalid credit card data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<CreditCardDto> createCreditCard(@RequestBody CreditCardRequest creditCardRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        CreditCardDto createdCard = creditCardService.createCreditCard(user, creditCardRequest);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }

    @Operation(summary = "Get current user's credit card information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credit card information retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Credit card not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<CreditCardDto> getCreditCard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        CreditCardDto creditCardDto = creditCardService.getUserCreditCardDto(user);
        
        return ResponseEntity.ok(creditCardDto);
    }

    @Operation(summary = "Check if current user has a credit card")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/exists")
    public ResponseEntity<Boolean> hasCreditCard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        boolean hasCard = creditCardService.hasUserCreditCard(user);
        return ResponseEntity.ok(hasCard);
    }

    @Operation(summary = "Validate credit card details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed"),
        @ApiResponse(responseCode = "400", description = "Invalid credit card data")
    })
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCreditCard(@RequestBody CreditCardDto creditCardDto) {
        boolean isValid = creditCardService.validateCreditCard(creditCardDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("maskedNumber", creditCardService.maskCardNumber(creditCardDto.number()));
        
        if (isValid) {
            response.put("message", "Credit card is valid");
        } else {
            response.put("message", "Credit card validation failed");
        }
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Check available credit for a transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credit check completed"),
        @ApiResponse(responseCode = "400", description = "Invalid data")
    })
    @PostMapping("/check-credit")
    public ResponseEntity<Map<String, Object>> checkAvailableCredit(
            @RequestBody CreditCardDto creditCardDto,
            @RequestParam BigDecimal amount) {
        
        boolean hasCredit = creditCardService.hasAvailableCredit(creditCardDto, amount);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasAvailableCredit", hasCredit);
        response.put("requestedAmount", amount);
        response.put("maskedNumber", creditCardService.maskCardNumber(creditCardDto.number()));
        
        if (hasCredit) {
            response.put("message", "Sufficient credit available");
        } else {
            response.put("message", "Insufficient credit limit");
        }
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current user's available credit")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available credit retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Credit card not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/available-credit")
    public ResponseEntity<BigDecimal> getAvailableCredit() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());
        
        CreditCard creditCard = creditCardService.findByUser(user);
        BigDecimal availableCredit = creditCard.getLimit().subtract(creditCard.getAmount());
        
        return ResponseEntity.ok(availableCredit);
    }
}