package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Resolves the user-facing transaction context (direction + type) for a payment,
 * accounting for cases where a single payment record represents both sides of a trade.
 */
@Component
public class PaymentContextResolver {

    private static final Set<PaymentTransactionType> SPECIAL_FLOWS = EnumSet.of(
            PaymentTransactionType.LISTING_CREATION,
            PaymentTransactionType.SHOWCASE_PAYMENT,
            PaymentTransactionType.REFUND,
            PaymentTransactionType.EWALLET_DEPOSIT,
            PaymentTransactionType.EWALLET_WITHDRAWAL,
            PaymentTransactionType.EWALLET_PAYMENT_RECEIVED,
            PaymentTransactionType.MEMBERSHIP_PAYMENT
    );

    public record InferredPaymentData(PaymentDirection direction, PaymentTransactionType transactionType) {}

    public InferredPaymentData resolve(Payment payment, Long currentUserId) {
        if (payment == null) {
            return new InferredPaymentData(PaymentDirection.OUTGOING, PaymentTransactionType.ITEM_PURCHASE);
        }

        PaymentTransactionType type = payment.getTransactionType();
        PaymentDirection direction = payment.getPaymentDirection();

        if (type == PaymentTransactionType.ITEM_SALE || type == PaymentTransactionType.ITEM_PURCHASE) {
            boolean isSender = payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUserId);
            boolean isReceiver = payment.getToUser() != null && payment.getToUser().getId().equals(currentUserId);

            if (isSender && isReceiver) {
                if (type == PaymentTransactionType.ITEM_SALE) {
                    return new InferredPaymentData(PaymentDirection.INCOMING, PaymentTransactionType.ITEM_SALE);
                }
                return new InferredPaymentData(PaymentDirection.OUTGOING, PaymentTransactionType.ITEM_PURCHASE);
            }

            return new InferredPaymentData(
                    isSender ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING,
                    isSender ? PaymentTransactionType.ITEM_PURCHASE : PaymentTransactionType.ITEM_SALE
            );
        }

        if (type != null && SPECIAL_FLOWS.contains(type)) {
            return new InferredPaymentData(direction != null ? direction : PaymentDirection.OUTGOING, type);
        }

        boolean isSender = payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUserId);
        return new InferredPaymentData(
                direction != null ? direction : (isSender ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING),
                type != null ? type : (isSender ? PaymentTransactionType.ITEM_PURCHASE : PaymentTransactionType.ITEM_SALE)
        );
    }
}

