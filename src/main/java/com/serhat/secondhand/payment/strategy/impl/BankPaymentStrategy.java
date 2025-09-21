package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BankPaymentStrategy implements PaymentStrategy {
    private final BankService bankService;

    @Override
    public PaymentType getPaymentType() {
        return PaymentType.TRANSFER;
    }

    @Override
    public boolean canProcess(User fromUser, User toUser, BigDecimal amount) {
        return bankService.findByUser(fromUser).isPresent();
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        try {
            bankService.debit(fromUser, amount);
            if (toUser != null) {
                bankService.credit(toUser, amount);
            }
            return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.TRANSFER, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.TRANSFER, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }
}
