package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PaymentRequestMapper {

    public List<PaymentRequest> buildOrderPaymentRequests(User user, List<Cart> cartItems, 
                                                         CheckoutRequest request, PricingResultDto pricing, String orderNumber) {
        Map<Long, List<Cart>> paymentsBySeller = groupCartItemsBySeller(cartItems);
        
        return paymentsBySeller.entrySet().stream()
                .map(entry -> {
                    Long sellerId = entry.getKey();
                    List<Cart> sellerItems = entry.getValue();
                    BigDecimal sellerTotal = resolveSellerTotal(sellerId, sellerItems, pricing);
                    String idempotencyKey = generateIdempotencyKey(orderNumber, sellerId);
                    return buildOrderPaymentRequestForSeller(user, sellerId, sellerItems, sellerTotal, request, idempotencyKey);
                })
                .collect(Collectors.toList());
    }
    
    private String generateIdempotencyKey(String orderNumber, Long sellerId) {
        return orderNumber + "-" + sellerId + "-" + System.currentTimeMillis();
    }

    public PaymentRequest buildOrderPaymentRequestForSeller(User user, Long sellerId, List<Cart> sellerItems, 
                                                           BigDecimal sellerTotal, CheckoutRequest request, String idempotencyKey) {
        var seller = sellerItems.get(0).getListing().getSeller();
        PaymentType paymentType = request.getPaymentType() != null ? request.getPaymentType() : PaymentType.CREDIT_CARD;

        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(sellerId)
                .receiverName(seller.getName())
                .receiverSurname(seller.getSurname())
                .listingId(sellerItems.get(0).getListing().getId())
                .amount(sellerTotal)
                .paymentType(paymentType)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.getPaymentVerificationCode())
                .agreementsAccepted(request.isAgreementsAccepted())
                .acceptedAgreementIds(request.getAcceptedAgreementIds())
                .idempotencyKey(idempotencyKey)
                .build();
    }

    public PaymentRequest buildListingFeePaymentRequest(User user, Listing listing, 
                                                       ListingFeePaymentRequest request, BigDecimal totalFee) {
        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName("System")
                .receiverSurname("Payment")
                .listingId(listing.getId())
                .amount(totalFee)
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .agreementsAccepted(request.agreementsAccepted())
                .acceptedAgreementIds(request.acceptedAgreementIds())
                .idempotencyKey(request.idempotencyKey())
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
                .amount(totalCost)
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.SHOWCASE_PAYMENT)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .agreementsAccepted(request.agreementsAccepted())
                .acceptedAgreementIds(request.acceptedAgreementIds())
                .idempotencyKey(request.idempotencyKey())
                .build();
    }

    public PaymentRequest buildGenericPaymentRequest(Long fromUserId, Long toUserId, String receiverName, 
                                                     String receiverSurname, java.util.UUID listingId,
                                                     BigDecimal amount, PaymentType paymentType,
                                                     PaymentTransactionType transactionType,
                                                     PaymentDirection paymentDirection,
                                                     String verificationCode, boolean agreementsAccepted,
                                                     List<java.util.UUID> acceptedAgreementIds, String idempotencyKey) {
        return PaymentRequest.builder()
                .fromUserId(fromUserId)
                .toUserId(toUserId)
                .receiverName(receiverName)
                .receiverSurname(receiverSurname)
                .listingId(listingId)
                .amount(amount)
                .paymentType(paymentType)
                .transactionType(transactionType)
                .paymentDirection(paymentDirection)
                .verificationCode(verificationCode)
                .agreementsAccepted(agreementsAccepted)
                .acceptedAgreementIds(acceptedAgreementIds)
                .idempotencyKey(idempotencyKey)
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

