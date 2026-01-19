package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.service.OrderCreationService;
import com.serhat.secondhand.order.service.OrderEscrowService;
import com.serhat.secondhand.order.service.OrderNotificationService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
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
    private final PricingService pricingService;
    private final CouponService couponService;
    private final OfferService offerService;
    private final ListingRepository listingRepository;
    private final OrderEscrowService orderEscrowService;

    @Transactional
    public OrderDto executeCheckout(User user, CheckoutRequest request) {
        log.info("Executing checkout for user: {}", user.getEmail());

        var cartItems = cartRepository.findByUserWithListing(user);
        Offer acceptedOffer = resolveAcceptedOffer(user, request);
        var effectiveCartItems = buildEffectiveCartItems(cartItems, acceptedOffer, user);

        PricingResultDto pricing = calculatePricing(user, effectiveCartItems, request, acceptedOffer);
        
        Map<UUID, Integer> reserved = reserveStockOrThrow(effectiveCartItems);
        
        Order order = orderCreationService.createOrder(user, effectiveCartItems, request, pricing);

        try {
            var paymentResult = orderPaymentService.processOrderPayments(user, effectiveCartItems, request, order, pricing);
            orderNotificationService.sendOrderNotifications(user, order, paymentResult.allSuccessful());

            if (paymentResult.allSuccessful()) {
                orderEscrowService.createEscrowsForOrder(order);
                handleSuccessfulCheckout(user, order, pricing, acceptedOffer);
                log.info("Checkout completed successfully for order: {} with {} payments",
                        order.getOrderNumber(), paymentResult.paymentResults().size());
            } else {
                releaseReservedStock(reserved);
                log.warn("Checkout completed with failed payments for order: {}", order.getOrderNumber());
            }

            return orderMapper.toDto(order);
        } catch (Exception e) {
            releaseReservedStock(reserved);
            throw e;
        }
    }

    private Offer resolveAcceptedOffer(User user, CheckoutRequest request) {
        if (request.getOfferId() == null) {
            return null;
        }
        return offerService.getAcceptedOfferForCheckout(user, request.getOfferId());
    }

    private List<Cart> buildEffectiveCartItems(List<Cart> cartItems, Offer acceptedOffer, User user) {
        if (acceptedOffer == null) {
            return cartItems;
        }

        var effectiveCartItems = new ArrayList<Cart>();
        for (var ci : cartItems) {
            if (ci.getListing() != null && acceptedOffer.getListing() != null && acceptedOffer.getListing().getId() != null
                    && acceptedOffer.getListing().getId().equals(ci.getListing().getId())) {
                continue;
            }
            effectiveCartItems.add(ci);
        }
        effectiveCartItems.add(Cart.builder()
                .user(user)
                .listing(acceptedOffer.getListing())
                .quantity(acceptedOffer.getQuantity())
                .notes(null)
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

    private Map<UUID, Integer> reserveStockOrThrow(List<Cart> cartItems) {
        Map<UUID, Integer> reserved = new HashMap<>();
        if (cartItems == null || cartItems.isEmpty()) {
            return reserved;
        }
        for (var item : cartItems) {
            if (item == null || item.getListing() == null || item.getListing().getId() == null) {
                continue;
            }
            
            int qty = item.getQuantity() != null ? item.getQuantity() : 1;
            if (qty < 1) {
                throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
            }
            
            Listing listing = listingRepository.findByIdWithLock(item.getListing().getId())
                    .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
            
            if (listing.getQuantity() == null) {
                continue;
            }
            
            if (listing.getQuantity() < qty) {
                releaseReservedStock(reserved);
                throw new BusinessException(ListingErrorCodes.STOCK_INSUFFICIENT);
            }
            
            listing.setQuantity(listing.getQuantity() - qty);
            listingRepository.save(listing);
            reserved.put(listing.getId(), qty);
        }
        return reserved;
    }

    private void releaseReservedStock(Map<UUID, Integer> reserved) {
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

    private void handleSuccessfulCheckout(User user, Order order, PricingResultDto pricing, Offer acceptedOffer) {
        if (pricing.getCouponCode() != null) {
            couponService.redeem(pricing.getCouponCode(), user, order);
        }
        if (acceptedOffer != null) {
            offerService.markCompleted(acceptedOffer);
        }
        clearCartReservations(user);
        cartRepository.deleteByUser(user);
    }

    private void clearCartReservations(User user) {
        var cartItems = cartRepository.findByUserWithListing(user);
        for (var cartItem : cartItems) {
            if (cartItem.getReservedAt() != null) {
                cartItem.setReservedAt(null);
                cartRepository.save(cartItem);
            }
        }
    }
}

