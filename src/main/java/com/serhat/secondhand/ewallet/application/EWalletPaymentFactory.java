package com.serhat.secondhand.ewallet.application;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class EWalletPaymentFactory {

    public Payment buildDepositPayment(User user, BigDecimal amount) {
        return Payment.builder()
                .fromUser(user)
                .toUser(user)
                .amount(amount)
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_DEPOSIT)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildWithdrawalPayment(User user, BigDecimal amount) {
        return Payment.builder()
                .fromUser(user)
                .toUser(user)
                .amount(amount)
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_WITHDRAWAL)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundPayment(User seller, User buyer, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(seller)
                .toUser(buyer)
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundDebitPayment(User seller, User buyer, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(seller)
                .toUser(buyer)
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildItemSalePayment(User buyer, User seller, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(buyer)
                .toUser(seller)
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.ITEM_SALE)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }
}
