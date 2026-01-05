package com.serhat.secondhand.payment.util;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PaymentValidationHelper {
    public User resolveToUser(PaymentRequest paymentRequest, UserService userService) {
        if (paymentRequest.transactionType() == PaymentTransactionType.ITEM_PURCHASE ||
            paymentRequest.transactionType() == PaymentTransactionType.ITEM_SALE) {
            if (paymentRequest.toUserId() == null) {
                return null;
            }
            return userService.findById(paymentRequest.toUserId());
        }
        return null;
    }

    public void validatePaymentRequest(PaymentRequest paymentRequest, User fromUser, User toUser) {
        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT.getMessage(), HttpStatus.BAD_REQUEST, PaymentErrorCodes.INVALID_AMOUNT.getCode());
        }
        if (paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION
                && paymentRequest.transactionType() != PaymentTransactionType.SHOWCASE_PAYMENT
                && toUser != null
                && fromUser.getId().equals(toUser.getId())) {
            throw new BusinessException(PaymentErrorCodes.SELF_PAYMENT.getMessage(), HttpStatus.BAD_REQUEST, PaymentErrorCodes.SELF_PAYMENT.getCode());
        }
        if (paymentRequest.paymentType() == null) {
            throw new BusinessException(PaymentErrorCodes.PAYMENT_TYPE_REQUIRED.getMessage(), HttpStatus.BAD_REQUEST, PaymentErrorCodes.PAYMENT_TYPE_REQUIRED.getCode());
        }
    }
}
