package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderCreationService orderCreationService;
    private final OrderPaymentService orderPaymentService;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final PricingService pricingService;
    private final CouponService couponService;
    private final OfferService offerService;
    private final ListingRepository listingRepository;

    public OrderDto checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getEmail());

        var cartItems = cartRepository.findByUserWithListing(user);

        Offer acceptedOffer = null;
        var effectiveCartItems = cartItems;
        if (request.getOfferId() != null) {
            acceptedOffer = offerService.getAcceptedOfferForCheckout(user, request.getOfferId());
            effectiveCartItems = new ArrayList<>();
            for (var ci : cartItems) {
                if (ci.getListing() != null && acceptedOffer.getListing() != null && acceptedOffer.getListing().getId() != null
                        && acceptedOffer.getListing().getId().equals(ci.getListing().getId())) {
                    continue;
                }
                effectiveCartItems.add(ci);
            }
            effectiveCartItems.add(com.serhat.secondhand.cart.entity.Cart.builder()
                    .user(user)
                    .listing(acceptedOffer.getListing())
                    .quantity(acceptedOffer.getQuantity())
                    .notes(null)
                    .build());
        }

        PricingResultDto pricing = acceptedOffer != null
                ? pricingService.priceCart(user, effectiveCartItems, request.getCouponCode(), acceptedOffer.getListing().getId(), acceptedOffer.getQuantity(), acceptedOffer.getTotalPrice())
                : pricingService.priceCart(user, effectiveCartItems, request.getCouponCode());

        Order order = orderCreationService.createOrder(user, effectiveCartItems, request, pricing);

        Map<java.util.UUID, Integer> reserved = reserveStockOrThrow(effectiveCartItems);

        var paymentResult = orderPaymentService.processOrderPayments(user, effectiveCartItems, request, order, pricing);

        orderNotificationService.sendOrderNotifications(user, order, paymentResult.allSuccessful());

        if (paymentResult.allSuccessful()) {
            if (pricing.getCouponCode() != null) {
                couponService.redeem(pricing.getCouponCode(), user, order);
            }
            if (acceptedOffer != null) {
                offerService.markCompleted(acceptedOffer);
            }
            cartRepository.deleteByUser(user);
            log.info("Checkout completed successfully for order: {} with {} payments",
                    order.getOrderNumber(), paymentResult.paymentResults().size());
        } else {
            releaseReservedStock(reserved);
            log.warn("Checkout completed with failed payments for order: {}", order.getOrderNumber());
        }

        return orderMapper.toDto(order);
    }

    private Map<java.util.UUID, Integer> reserveStockOrThrow(java.util.List<com.serhat.secondhand.cart.entity.Cart> cartItems) {
        Map<java.util.UUID, Integer> reserved = new HashMap<>();
        if (cartItems == null || cartItems.isEmpty()) {
            return reserved;
        }
        for (var item : cartItems) {
            if (item == null || item.getListing() == null || item.getListing().getId() == null) {
                continue;
            }
            Integer stock = item.getListing().getQuantity();
            if (stock == null) {
                continue;
            }
            int qty = item.getQuantity() != null ? item.getQuantity() : 1;
            if (qty < 1) {
                throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
            }
            int updated = listingRepository.decrementQuantityIfEnough(item.getListing().getId(), qty);
            if (updated != 1) {
                releaseReservedStock(reserved);
                throw new BusinessException(ListingErrorCodes.STOCK_INSUFFICIENT);
            }
            reserved.put(item.getListing().getId(), qty);
        }
        return reserved;
    }

    private void releaseReservedStock(Map<java.util.UUID, Integer> reserved) {
        if (reserved == null || reserved.isEmpty()) {
            return;
        }
        for (var entry : reserved.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) {
                continue;
            }
            listingRepository.incrementQuantity(entry.getKey(), entry.getValue());
        }
    }
}
