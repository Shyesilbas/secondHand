package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.ewallet.service.EWalletService;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
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
        if (fromUser == null) {
            throw new BusinessException(PaymentErrorCodes.NULL_RECIPIENT);
        }
        if (!eWalletService.hasSufficientBalance(fromUser, amount)) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }
        return true;
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        return eWalletService.processEWalletPayment(fromUser, toUser, amount, listingId);
    }
}
