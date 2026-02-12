package com.serhat.secondhand.payment.util;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PaymentValidationHelper {
    public User resolveToUser(PaymentRequest paymentRequest, IUserService userService) {
        if (paymentRequest.transactionType() == PaymentTransactionType.ITEM_PURCHASE ||
            paymentRequest.transactionType() == PaymentTransactionType.ITEM_SALE) {
            if (paymentRequest.toUserId() == null) {
                return null;
            }
            Result<User> userResult = userService.findById(paymentRequest.toUserId());
            if (userResult.isError()) {
                return null;
            }
            return userResult.getData();
        }
        return null;
    }

    public Result<Void> validatePaymentRequest(PaymentRequest paymentRequest, User fromUser, User toUser) {
        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_AMOUNT);
        }
        if (paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION
                && paymentRequest.transactionType() != PaymentTransactionType.SHOWCASE_PAYMENT
                && toUser != null
                && fromUser.getId().equals(toUser.getId())) {
            return Result.error(PaymentErrorCodes.SELF_PAYMENT);
        }
        if (paymentRequest.paymentType() == null) {
            return Result.error(PaymentErrorCodes.PAYMENT_TYPE_REQUIRED);
        }
        return Result.success();
    }
}
