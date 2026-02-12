package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.IOfferService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.service.OrderCreationService;
import com.serhat.secondhand.order.service.OrderEscrowService;
import com.serhat.secondhand.order.service.OrderNotificationService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.IPricingService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckoutOrchestrator {

    private final CartRepository cartRepository;
    private final OrderCreationService orderCreationService;
    private final OrderPaymentService orderPaymentService;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final IPricingService pricingService;
    private final CouponService couponService;
    private final IOfferService offerService;
    private final ListingRepository listingRepository;
    private final OrderEscrowService orderEscrowService;
    private final IUserService userService;

    @Transactional
    public Result<OrderDto> executeCheckout(Long userId, CheckoutRequest request) {
        log.info("Executing checkout for userId: {}", userId);

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }
        User user = userResult.getData();

        var cartItems = cartRepository.findByUserIdWithListing(userId);
        Result<Offer> offerResult = resolveAcceptedOffer(userId, request);
        if (offerResult.isError()) {
            return Result.error(offerResult.getErrorCode(), offerResult.getMessage());
        }

        Offer acceptedOffer = offerResult.getData();
        var effectiveCartItems = buildEffectiveCartItems(cartItems, acceptedOffer, user);

        PricingResultDto pricing = calculatePricing(user, effectiveCartItems, request, acceptedOffer);

        Result<Map<UUID, Integer>> reservedResult = reserveStockOrThrow(effectiveCartItems);
        if (reservedResult.isError()) {
            return Result.error(reservedResult.getErrorCode(), reservedResult.getMessage());
        }

        Map<UUID, Integer> reserved = reservedResult.getData();

        Result<Order> orderResult = orderCreationService.createOrder(user, effectiveCartItems, request, pricing);
        if (orderResult.isError()) {
            releaseReservedStock(reserved);
            return Result.error(orderResult.getErrorCode(), orderResult.getMessage());
        }

        Order order = orderResult.getData();

        try {
            var paymentResult = orderPaymentService.processPaymentsForOrder(user, effectiveCartItems, request, order, pricing);
            if (paymentResult.isError()) {
                releaseReservedStock(reserved);
                return Result.error(paymentResult.getErrorCode(), paymentResult.getMessage());
            }

            var paymentProcessingResult = paymentResult.getData();

            if (paymentProcessingResult.allSuccessful()) {
                orderEscrowService.createEscrowsForOrder(order);
                handleSuccessfulCheckout(userId, order, pricing, acceptedOffer);
                orderNotificationService.sendOrderNotifications(user, order, true);
                log.info("Checkout completed successfully for order: {}", order.getOrderNumber());
            } else {
                releaseReservedStock(reserved);
                orderNotificationService.sendOrderNotifications(user, order, false);
                log.warn("Checkout payment failed for order: {}", order.getOrderNumber());
                return Result.error("PAYMENT_FAILED", "Error occurred during checkout payment. Please try again later.");
            }

            return Result.success(orderMapper.toDto(order));

        } catch (Exception e) {
            releaseReservedStock(reserved);
            log.error("Critical exception during checkout for order: {}", order.getOrderNumber(), e);
            throw e;
        }
    }

    private Result<Offer> resolveAcceptedOffer(Long userId, CheckoutRequest request) {
        if (request.getOfferId() == null) {
            return Result.success(null);
        }
        return offerService.getAcceptedOfferForCheckout(userId, request.getOfferId());
    }

    private List<Cart> buildEffectiveCartItems(List<Cart> cartItems, Offer acceptedOffer, User user) {
        if (acceptedOffer == null) {
            return cartItems;
        }

        List<Cart> effectiveCartItems = new ArrayList<>();
        UUID offerListingId = acceptedOffer.getListing().getId();

        for (Cart ci : cartItems) {
            if (ci.getListing() != null && ci.getListing().getId().equals(offerListingId)) {
                continue;
            }
            effectiveCartItems.add(ci);
        }

        effectiveCartItems.add(Cart.builder()
                .user(user)
                .listing(acceptedOffer.getListing())
                .quantity(acceptedOffer.getQuantity())
                .build());

        return effectiveCartItems;
    }

    private PricingResultDto calculatePricing(User user, List<Cart> effectiveCartItems, CheckoutRequest request, Offer acceptedOffer) {
        if (acceptedOffer != null) {
            return pricingService.priceCart(user, effectiveCartItems, request.getCouponCode(),
                    acceptedOffer.getListing().getId(), acceptedOffer.getQuantity(), acceptedOffer.getTotalPrice());
        }
        return pricingService.priceCart(user, effectiveCartItems, request.getCouponCode());
    }

    private Result<Map<UUID, Integer>> reserveStockOrThrow(List<Cart> cartItems) {
        Map<UUID, Integer> reserved = new HashMap<>();
        for (Cart item : cartItems) {
            Listing listing = listingRepository.findByIdWithLock(item.getListing().getId())
                    .orElse(null);

            if (listing == null) {
                releaseReservedStock(reserved);
                return Result.error(ListingErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
            }

            if (listing.getQuantity() != null) {
                int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
                if (listing.getQuantity() < requestedQty) {
                    releaseReservedStock(reserved);
                    return Result.error(ListingErrorCodes.STOCK_INSUFFICIENT.toString(), "Stock Insufficient.");
                }
                listing.setQuantity(listing.getQuantity() - requestedQty);
                listingRepository.save(listing);
                reserved.put(listing.getId(), requestedQty);
            }
        }
        return Result.success(reserved);
    }

    private void releaseReservedStock(Map<UUID, Integer> reserved) {
        if (reserved == null) return;
        reserved.forEach(listingRepository::incrementQuantity);
    }

    private void handleSuccessfulCheckout(Long userId, Order order, PricingResultDto pricing, Offer acceptedOffer) {
        if (pricing.getCouponCode() != null) {
            couponService.redeem(pricing.getCouponCode(), userId, order);
        }
        if (acceptedOffer != null) {
            offerService.markCompleted(acceptedOffer);
        }
        cartRepository.deleteByUserId(userId);
    }
}