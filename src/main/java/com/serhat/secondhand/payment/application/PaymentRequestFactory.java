package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.dto.CheckoutRequest;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PaymentRequestFactory {

    public List<PaymentRequest> buildOrderPaymentRequests(User user, List<Cart> cartItems,
                                                          CheckoutRequest request, PricingResultDto pricing, String orderNumber, java.util.UUID orderExternalId) {
        Map<Long, List<Cart>> paymentsBySeller = groupCartItemsBySeller(cartItems);

        return paymentsBySeller.entrySet().stream()
                .map(entry -> {
                    Long sellerId = entry.getKey();
                    List<Cart> sellerItems = entry.getValue();
                    BigDecimal sellerTotal = resolveSellerTotal(sellerId, sellerItems, pricing);
                    String idempotencyKey = orderNumber + "-" + sellerId;
                    return buildOrderPaymentRequestForSeller(user, sellerId, sellerItems, sellerTotal, request, idempotencyKey, orderExternalId);
                })
                .collect(Collectors.toList());
    }

    public PaymentRequest buildOrderPaymentRequestForSeller(User user, Long sellerId, List<Cart> sellerItems,
                                                             BigDecimal sellerTotal, CheckoutRequest request, String idempotencyKey, java.util.UUID orderExternalId) {
        PaymentType paymentType = request.getPaymentType() != null ? request.getPaymentType() : PaymentType.CREDIT_CARD;

        Listing firstListing = sellerItems.get(0).getListing();
        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(sellerId)
                .receiverName(PaymentProcessingConstants.SYSTEM_RECEIVER_NAME)
                .receiverSurname(PaymentProcessingConstants.ESCROW_RECEIVER_SURNAME)
                .listingId(firstListing.getId())
                .listingTitle(firstListing.getTitle())
                .listingNo(firstListing.getListingNo())
                .amount(sellerTotal)
                .currency(firstListing.getCurrency() != null ? firstListing.getCurrency().name() : "TRY")
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

    private Map<Long, List<Cart>> groupCartItemsBySeller(List<Cart> cartItems) {
        return cartItems.stream()
                .collect(Collectors.groupingBy(cart -> cart.getListing().getSeller().getId()));
    }

    private BigDecimal resolveSellerTotal(Long sellerId, List<Cart> sellerItems, PricingResultDto pricing) {
        if (pricing != null && pricing.getPayableBySeller() != null && pricing.getPayableBySeller().containsKey(sellerId)) {
            return pricing.getPayableBySeller().get(sellerId);
        }
        return sellerItems.stream()
                .map(cart -> cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
