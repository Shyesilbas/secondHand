package com.serhat.secondhand.payment.strategy.impl;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.payment.validator.BankValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BankPaymentStrategy implements PaymentStrategy {
    private final BankService bankService;
    private final BankValidator bankValidator;

    @Override
    public PaymentType getPaymentType() {
        return PaymentType.TRANSFER;
    }

    @Override
    public boolean canProcess(User fromUser, User toUser, BigDecimal amount) {
        return bankValidator.hasSufficientBalance(fromUser, amount);
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        return bankService.processBankPayment(fromUser, toUser, amount, listingId);
    }
}
