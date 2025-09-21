package com.serhat.secondhand.payment.strategy;

import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.user.domain.entity.User;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentStrategy {
    PaymentType getPaymentType();
    boolean canProcess(User fromUser, User toUser, BigDecimal amount);
    PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request);
}
