package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.CreditCardService;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CreditCardPaymentStrategy implements PaymentStrategy {
    
    private final CreditCardService creditCardService;

    @Override
    public PaymentType getPaymentType() {
        return PaymentType.CREDIT_CARD;
    }

    @Override
    public boolean canProcess(User fromUser, User toUser, BigDecimal amount) {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        try {
            log.info("Processing credit card payment for user: {} amount: {}", fromUser.getEmail(), amount);
            
            // Process the actual payment through CreditCardService
            boolean paymentSuccessful = creditCardService.processPayment(fromUser, amount);
            
            if (paymentSuccessful) {
                log.info("Credit card payment successful for user: {} amount: {}", fromUser.getEmail(), amount);
                return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
            } else {
                log.warn("Credit card payment failed for user: {} amount: {}", fromUser.getEmail(), amount);
                return PaymentResult.failure("Payment processing failed - insufficient funds or processing error", amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
            }
        } catch (Exception e) {
            log.error("Error processing credit card payment for user: {} amount: {}", fromUser.getEmail(), amount, e);
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }
}
