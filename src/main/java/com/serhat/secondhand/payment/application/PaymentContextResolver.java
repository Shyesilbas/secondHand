package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Resolves the user-facing transaction context (direction + type) for a payment,
 * accounting for cases where a single payment record represents both sides of a trade.
 */
@Component
public class PaymentContextResolver {

    public record InferredPaymentData(PaymentDirection direction, PaymentTransactionType transactionType) {}

    public InferredPaymentData resolve(Payment payment, Long currentUserId) {
        if (payment.getTransactionType() == PaymentTransactionType.ITEM_SALE
                || payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE) {

            boolean isSender = payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUserId);
            boolean isReceiver = payment.getToUser() != null && payment.getToUser().getId().equals(currentUserId);

            if (isSender && isReceiver) {
                if (payment.getTransactionType() == PaymentTransactionType.ITEM_SALE) {
                    return new InferredPaymentData(PaymentDirection.INCOMING, PaymentTransactionType.ITEM_SALE);
                }
                return new InferredPaymentData(PaymentDirection.OUTGOING, PaymentTransactionType.ITEM_PURCHASE);
            }

            return new InferredPaymentData(
                    isSender ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING,
                    isSender ? PaymentTransactionType.ITEM_PURCHASE : PaymentTransactionType.ITEM_SALE
            );
        }

        boolean isSpecialFlow = List.of(
                PaymentTransactionType.LISTING_CREATION,
                PaymentTransactionType.SHOWCASE_PAYMENT,
                PaymentTransactionType.REFUND,
                PaymentTransactionType.EWALLET_DEPOSIT,
                PaymentTransactionType.EWALLET_WITHDRAWAL,
                PaymentTransactionType.EWALLET_PAYMENT_RECEIVED
        ).contains(payment.getTransactionType());

        if (isSpecialFlow) {
            return new InferredPaymentData(payment.getPaymentDirection(), payment.getTransactionType());
        }

        boolean isSender = payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUserId);
        return new InferredPaymentData(
                isSender ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING,
                isSender ? PaymentTransactionType.ITEM_PURCHASE : PaymentTransactionType.ITEM_SALE
        );
    }
}
