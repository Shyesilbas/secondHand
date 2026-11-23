package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentDto(
        UUID paymentId,
        String senderDisplayName,
        String receiverDisplayName,
        BigDecimal amount,
        String currency,
        String providerName,
        String providerTransactionId,
        PaymentTransactionType transactionType,
        PaymentDirection paymentDirection,
        UUID listingId,
        String listingTitle,
        String listingNo,
        LocalDateTime processedAt,
        PaymentStatus status,
        boolean isSuccess,
        String description,
        /** Seller-side item payments only: how the buyer-paid amount became the payout; null otherwise. */
        SellerBreakdown sellerBreakdown
) {
    public PaymentDto(UUID paymentId, String senderDisplayName, String receiverDisplayName, BigDecimal amount,
                      String currency, String providerName, String providerTransactionId,
                      PaymentTransactionType transactionType, PaymentDirection paymentDirection, UUID listingId,
                      String listingTitle, String listingNo, LocalDateTime processedAt, PaymentStatus status,
                      boolean isSuccess, String description) {
        this(paymentId, senderDisplayName, receiverDisplayName, amount, currency, providerName, providerTransactionId,
                transactionType, paymentDirection, listingId, listingTitle, listingNo, processedAt, status, isSuccess,
                description, null);
    }

    /** Sale amount (buyer paid + platform coupon share), commission, free-shipping deduction and the net payout. */
    public record SellerBreakdown(BigDecimal buyerPaid, BigDecimal platformSubsidy, BigDecimal saleAmount,
                                  BigDecimal commission, BigDecimal commissionRate, BigDecimal shippingDeduction,
                                  BigDecimal netAmount) {}
}
