package com.serhat.secondhand.payment.api;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.creditcard.CreditCardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/credit-card")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Management", description = "Credit card operations for users")
public class CreditCardController {

    private final CreditCardService creditCardService;

    @PostMapping
    public ResponseEntity<CreditCardDto> createCreditCard(@RequestBody CreditCardRequest creditCardRequest,
                                                          Authentication authentication) {
        log.info("Creating credit card for user: {}", authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(creditCardService.createCreditCard(creditCardRequest, authentication));
    }

    @GetMapping
    public ResponseEntity<List<CreditCardDto>> getCreditCards(Authentication authentication) {
        log.info("Getting credit cards for user: {}", authentication.getName());
        return ResponseEntity.ok(creditCardService.getCreditCards(authentication));
    }

    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkCreditCardExists(Authentication authentication) {
        log.info("Checking credit card existence for user: {}", authentication.getName());
        return ResponseEntity.ok(creditCardService.checkCreditCardExists(authentication));
    }

    @GetMapping("/available-credit")
    public ResponseEntity<Map<String, Object>> getAvailableCredit(Authentication authentication) {
        log.info("Getting available credit for user: {}", authentication.getName());
        return ResponseEntity.ok(creditCardService.getAvailableCredit(authentication));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCreditCard(@PathVariable UUID cardId, Authentication authentication) {
        log.info("Deleting credit card {} for user: {}", cardId, authentication.getName());
        creditCardService.deleteCreditCard(cardId, authentication);
        return ResponseEntity.noContent().build();
    }
}
