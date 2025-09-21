package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class CreditCardPaymentStrategy implements PaymentStrategy {
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
            // Gerçek bir entegrasyon yok, mock success
            return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }
}
