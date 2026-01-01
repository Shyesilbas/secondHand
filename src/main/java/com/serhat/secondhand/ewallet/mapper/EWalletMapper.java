package com.serhat.secondhand.ewallet.mapper;

import com.serhat.secondhand.ewallet.dto.EWalletDto;
import com.serhat.secondhand.ewallet.dto.EwalletRequest;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.util.EWalletBalanceUtil;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class EWalletMapper {

    public EWalletDto toDto(EWallet eWallet) {
        return new EWalletDto(
                eWallet.getUser().getId(),
                eWallet.getBalance(),
                eWallet.getWalletLimit(),
                eWallet.getSpendingWarningLimit()
        );
    }

    public EWallet fromCreateRequest(EwalletRequest request, User user) {
        return EWallet.builder()
                .user(user)
                .balance(EWalletBalanceUtil.zero())
                .walletLimit(request.limit())
                .spendingWarningLimit(request.spendingWarningLimit())
                .build();
    }

    public EWallet createDefaultEWallet(User user, BigDecimal defaultLimit) {
        return EWallet.builder()
                .user(user)
                .balance(EWalletBalanceUtil.zero())
                .walletLimit(defaultLimit != null ? EWalletBalanceUtil.scale(defaultLimit) : new BigDecimal("10000.00"))
                .build();
    }

    public Payment buildDepositPayment(User user, BigDecimal amount) {
        return Payment.builder()
                .fromUser(user)
                .toUser(null)
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
                .toUser(null)
                .amount(amount)
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_WITHDRAWAL)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundPayment(User user, BigDecimal amount, java.util.UUID listingId) {
        return Payment.builder()
                .fromUser(user)
                .toUser(user)
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    public Payment buildRefundDebitPayment(User seller, BigDecimal amount, java.util.UUID listingId) {
        return Payment.builder()
                .fromUser(seller)
                .toUser(null)
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }
}

