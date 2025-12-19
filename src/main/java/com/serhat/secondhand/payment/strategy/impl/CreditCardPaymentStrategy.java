package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.CreditCardService;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
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
        if (creditCardService.findByUser(fromUser).isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND);
        }
        if (!creditCardService.hasSufficientCredit(fromUser, amount)) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_FUNDS);
        }
        return true;
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        return creditCardService.processCreditCardPayment(fromUser, toUser, amount, listingId);
    }
}
