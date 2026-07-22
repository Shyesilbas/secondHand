package com.serhat.secondhand.ewallet.application;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;

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
                .providerName("EWALLET")
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
                .providerName("EWALLET")
                .transactionType(PaymentTransactionType.EWALLET_WITHDRAWAL)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundPayment(User seller, User buyer, BigDecimal amount, UUID listingId, String listingTitle, String listingNo) {
        return Payment.builder()
                .fromUser(seller)
                .toUser(buyer)
                .amount(amount)
                .providerName("EWALLET")
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .listingTitle(listingTitle)
                .listingNo(listingNo)
                .description(String.format("Refund for item: %s (%s)", listingTitle, listingNo))
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundDebitPayment(User seller, User buyer, BigDecimal amount, UUID listingId, String listingTitle, String listingNo) {
        return Payment.builder()
                .fromUser(seller)
                .toUser(buyer)
                .amount(amount)
                .providerName("EWALLET")
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(listingId)
                .listingTitle(listingTitle)
                .listingNo(listingNo)
                .description(String.format("Refund debit for item: %s (%s)", listingTitle, listingNo))
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildItemSalePayment(User buyer, User seller, BigDecimal amount, UUID listingId, String listingTitle, String listingNo) {
        return Payment.builder()
                .fromUser(buyer)
                .toUser(seller)
                .amount(amount)
                .providerName("EWALLET")
                .transactionType(PaymentTransactionType.ITEM_SALE)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .listingTitle(listingTitle)
                .listingNo(listingNo)
                .description(String.format("Sale of item: %s (%s)", listingTitle, listingNo))
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }
}
