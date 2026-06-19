package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentRequestFactory {

    public List<PaymentRequest> buildOrderPaymentRequests(User user, Order order,
                                                          CheckoutRequest request, PricingResultDto pricing, String orderNumber, java.util.UUID orderExternalId) {
        return buildPayableAmountsByOrderItem(order).stream()
                .map(itemAmount -> {
                    OrderItem item = itemAmount.orderItem();
                    String idempotencyKey = orderNumber + "-item-" + item.getId();
                    return buildOrderPaymentRequestForItem(user, item, itemAmount.amount(), request, idempotencyKey, orderExternalId);
                })
                .collect(Collectors.toList());
    }

    public PaymentRequest buildOrderPaymentRequestForItem(User user, OrderItem item,
                                                           BigDecimal itemPayableAmount, CheckoutRequest request, String idempotencyKey, java.util.UUID orderExternalId) {
        PaymentType paymentType = request.getPaymentType() != null ? request.getPaymentType() : PaymentType.EWALLET;

        Listing listing = item.getListing();
        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(item.getSeller().getId())
                .receiverName(PaymentProcessingConstants.SYSTEM_RECEIVER_NAME)
                .receiverSurname(PaymentProcessingConstants.ESCROW_RECEIVER_SURNAME)
                .listingId(listing.getId())
                .orderItemId(item.getId())
                .listingTitle(listing.getTitle())
                .listingNo(listing.getListingNo())
                .amount(itemPayableAmount)
                .currency(listing.getCurrency() != null ? listing.getCurrency().name() : "TRY")
                .paymentType(paymentType)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.getPaymentVerificationCode())
                .agreementsAccepted(request.isAgreementsAccepted())
                .acceptedAgreementIds(request.getAcceptedAgreementIds())
                .idempotencyKey(idempotencyKey)
                .status(com.serhat.secondhand.payment.entity.PaymentStatus.ESCROW)
                .orderId(orderExternalId)
                .build();
    }

    public PaymentRequest buildShowcasePaymentRequest(User user, Listing listing,
                                                      ShowcasePaymentRequest request, BigDecimal totalCost) {
        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName(user.getName())
                .receiverSurname(user.getSurname())
                .listingId(listing.getId())
                .orderItemId(null)
                .listingTitle(listing.getTitle())
                .listingNo(listing.getListingNo())
                .amount(totalCost)
                .currency(listing.getCurrency() != null ? listing.getCurrency().name() : "TRY")
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.SHOWCASE_PAYMENT)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .agreementsAccepted(request.agreementsAccepted())
                .acceptedAgreementIds(request.acceptedAgreementIds())
                .idempotencyKey(request.idempotencyKey())
                .build();
    }

    public PaymentRequest buildShowcaseExtensionRequest(User user, Listing listing,
                                                         ShowcasePaymentRequest request, BigDecimal additionalCost) {
        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName(user.getName())
                .receiverSurname(user.getSurname())
                .listingId(listing.getId())
                .orderItemId(null)
                .listingTitle(listing.getTitle())
                .listingNo(listing.getListingNo())
                .amount(additionalCost)
                .currency(listing.getCurrency() != null ? listing.getCurrency().name() : "TRY")
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.SHOWCASE_PAYMENT)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .agreementsAccepted(request.agreementsAccepted())
                .acceptedAgreementIds(request.acceptedAgreementIds())
                .idempotencyKey(request.idempotencyKey() != null ? request.idempotencyKey() : "extend-" + listing.getId() + "-" + request.days() + "-" + System.currentTimeMillis())
                .build();
    }

    private List<OrderItemAmount> buildPayableAmountsByOrderItem(Order order) {
        if (order == null || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return List.of();
        }

        List<OrderItem> items = new ArrayList<>(order.getOrderItems());
        items.sort(Comparator.comparing(OrderItem::getId, Comparator.nullsLast(Long::compareTo)));

        BigDecimal itemSubtotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (itemSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return items.stream().map(item -> new OrderItemAmount(item, BigDecimal.ZERO)).toList();
        }

        BigDecimal payableTotal = order.getTotalAmount() != null ? order.getTotalAmount() : itemSubtotal;
        if (payableTotal.compareTo(BigDecimal.ZERO) < 0) {
            payableTotal = BigDecimal.ZERO;
        }
        if (payableTotal.compareTo(itemSubtotal) > 0) {
            payableTotal = itemSubtotal;
        }
        payableTotal = payableTotal.setScale(2, RoundingMode.HALF_UP);

        List<OrderItemAmount> result = new ArrayList<>();
        BigDecimal remaining = payableTotal;
        for (int i = 0; i < items.size(); i++) {
            OrderItem item = items.get(i);
            BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO;
            BigDecimal amount;
            if (i == items.size() - 1) {
                amount = remaining;
            } else {
                amount = payableTotal.multiply(itemTotal)
                        .divide(itemSubtotal, 2, RoundingMode.HALF_UP);
                if (amount.compareTo(remaining) > 0) {
                    amount = remaining;
                }
            }
            amount = amount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            result.add(new OrderItemAmount(item, amount));
            remaining = remaining.subtract(amount).setScale(2, RoundingMode.HALF_UP);
        }
        return result;
    }

    private record OrderItemAmount(OrderItem orderItem, BigDecimal amount) {}
}
