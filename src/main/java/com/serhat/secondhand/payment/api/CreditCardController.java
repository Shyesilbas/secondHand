package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.service.CreditCardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/credit-card")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Management", description = "Credit card operations for users")
public class CreditCardController {

    private final CreditCardService creditCardService;


    @PostMapping
    public ResponseEntity<CreditCardDto> createCreditCard(@RequestBody CreditCardRequest creditCardRequest, Authentication authentication) {
        log.info("Creating credit card for user: {}", authentication.getName());
        CreditCardDto creditCardDto = creditCardService.createCreditCard(creditCardRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creditCardDto);
    }


    @GetMapping
    public ResponseEntity<CreditCardDto> getCreditCard(Authentication authentication) {
        log.info("Getting credit card for user: {}", authentication.getName());
        CreditCardDto creditCardDto = creditCardService.getCreditCard(authentication);
        return ResponseEntity.ok(creditCardDto);
    }


    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkCreditCardExists(Authentication authentication) {
        log.info("Checking credit card existence for user: {}", authentication.getName());
        Map<String, Object> response = creditCardService.checkCreditCardExists(authentication);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/available-credit")
    public ResponseEntity<Map<String, Object>> getAvailableCredit(Authentication authentication) {
        log.info("Getting available credit for user: {}", authentication.getName());
        Map<String, Object> response = creditCardService.getAvailableCredit(authentication);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCreditCard(Authentication authentication) {
        log.info("Deleting credit card for user: {}", authentication.getName());
        creditCardService.deleteCreditCard(authentication);
        return ResponseEntity.noContent().build();
    }
}
