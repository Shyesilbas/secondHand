package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.ewallet.service.EWalletService;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EWalletPaymentStrategy implements PaymentStrategy {
    private final EWalletService eWalletService;

    @Override
    public PaymentType getPaymentType() {
        return PaymentType.EWALLET;
    }

    @Override
    public boolean canProcess(User fromUser, User toUser, BigDecimal amount) {
        return eWalletService.hasSufficientBalance(fromUser.getId(), amount);
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        try {
            eWalletService.processEWalletPayment(fromUser, toUser, amount, listingId);
            return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.EWALLET, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.EWALLET, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }
}
