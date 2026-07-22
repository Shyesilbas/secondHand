package com.serhat.secondhand.payment.util;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import org.springframework.stereotype.Component;

@Component
public class PaymentIdempotencyHelper {

    public String buildIdempotencyKey(PaymentRequest paymentRequest, Long userId) {
        return String.format("payment-%s-%s-%s-%s",
                userId,
                paymentRequest.amount(),
                paymentRequest.listingId() != null ? paymentRequest.listingId() : "null",
                paymentRequest.providerName());
    }

    public PaymentRequest withIdempotencyKey(PaymentRequest original, String idempotencyKey) {
        return PaymentRequest.builder()
                .fromUserId(original.fromUserId())
                .toUserId(original.toUserId())
                .receiverName(original.receiverName())
                .receiverSurname(original.receiverSurname())
                .listingId(original.listingId())
                .orderItemId(original.orderItemId())
                .listingTitle(original.listingTitle())
                .listingNo(original.listingNo())
                .amount(original.amount())
                .currency(original.currency())
                .providerName(original.providerName())
                .transactionType(original.transactionType())
                .paymentDirection(original.paymentDirection())
                .verificationCode(original.verificationCode())
                .agreementsAccepted(original.agreementsAccepted())
                .acceptedAgreementIds(original.acceptedAgreementIds())
                .idempotencyKey(idempotencyKey)
                .status(original.status())
                .orderId(original.orderId())
                .description(original.description())
                .build();
    }
}
