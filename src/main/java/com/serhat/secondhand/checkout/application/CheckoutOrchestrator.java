package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.domain.entity.enums.RestrictedAction;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.application.event.OrderCreatedEvent;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.CheckoutResultDto;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.application.OrderPaymentService;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckoutOrchestrator {

    private final CartRepository cartRepository;
    private final OrderCreationService orderCreationService;
    private final OrderPaymentService orderPaymentService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CouponService couponService;
    private final IOfferService offerService;
    private final EscrowService escrowService;
    private final CheckoutPricingContextFactory checkoutPricingContextFactory;
    private final CheckoutStockReservationService checkoutStockReservationService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserRestrictionService userRestrictionService;
    private final com.serhat.secondhand.user.application.UserBlockService userBlockService;

    /**
     * Places one order per seller in a single transaction. Every order is paid and put in escrow
     * before anything is finalized; if any order fails, the whole checkout is rolled back.
     */
    @Transactional
    public Result<CheckoutResultDto> executeCheckout(Long userId, CheckoutRequest request) {
        log.info("Executing checkout for userId: {}", userId);

        Result<Void> restriction = userRestrictionService.check(userId, RestrictedAction.CHECKOUT);
        if (restriction.isError()) {
            return Result.error(restriction.getMessage(), restriction.getErrorCode());
        }

        Result<CheckoutPricingContextFactory.CheckoutPricingContext> pricingContextResult =
                checkoutPricingContextFactory.build(userId, request);
        if (pricingContextResult.isError()) {
            return Result.error(pricingContextResult.getMessage(), pricingContextResult.getErrorCode());
        }

        CheckoutPricingContextFactory.CheckoutPricingContext pricingContext = pricingContextResult.getData();
        User user = pricingContext.user();
        List<Cart> effectiveCartItems = pricingContext.effectiveCartItems();
        Offer acceptedOffer = pricingContext.acceptedOffer();
        PricingResultDto pricing = pricingContext.pricing();

        // A new purchase is closed between blocked users; orders that already run are not touched.
        for (Cart item : effectiveCartItems) {
            if (item.getListing() != null && item.getListing().getSeller() != null) {
                userBlockService.requireNotBlocked(userId, item.getListing().getSeller().getId());
            }
        }

        Result<Map<UUID, Integer>> reservedResult = checkoutStockReservationService.reserveStock(userId, effectiveCartItems);
        if (reservedResult.isError()) {
            return Result.error(reservedResult.getMessage(), reservedResult.getErrorCode());
        }

        Map<UUID, Integer> reserved = new HashMap<>(reservedResult.getData());
        if (acceptedOffer != null) {
            // The offer listing's stock is the offer's own hold (OfferStockHoldService); a failed checkout must
            // leave it for the buyer's retry. On success consumeReservationsOnSuccess still moves it to pending.
            reserved.remove(acceptedOffer.getListing().getId());
        }

        Result<List<Order>> ordersResult = orderCreationService.createOrders(user, effectiveCartItems, request, pricing);
        if (ordersResult.isError()) {
            rollbackCheckout();
            checkoutStockReservationService.releaseReservedStock(userId, reserved);
            return Result.error(ordersResult.getMessage(), ordersResult.getErrorCode());
        }

        List<Order> orders = ordersResult.getData();
        String orderNumbers = orders.stream().map(Order::getOrderNumber).collect(Collectors.joining(","));

        try {
            for (Order order : orders) {
                Result<List<PaymentDto>> paymentResult = orderPaymentService.processPaymentsForOrder(
                        user, order, request, order.getOrderNumber(), pricing, order.getExternalId());

                if (paymentResult.isError()) {
                    rollbackCheckout();
                    checkoutStockReservationService.releaseReservedStock(userId, reserved);
                    return Result.error(paymentResult.getMessage(), paymentResult.getErrorCode());
                }

                List<PaymentDto> paymentResults = paymentResult.getData();
                if (!paymentResults.stream().allMatch(PaymentDto::isSuccess)) {
                    rollbackCheckout();
                    checkoutStockReservationService.releaseReservedStock(userId, reserved);
                    log.warn("Checkout payment failed for order: {}", order.getOrderNumber());
                    return Result.error("PAYMENT_FAILED", "Error occurred during checkout payment. Please try again later.");
                }

                applyPaymentResultToOrder(order, paymentResults, true, request.getProviderName());
                Result<Void> escrowResult = escrowService.hold(order);
                if (escrowResult.isError()) {
                    throw new IllegalStateException("Escrow creation failed for order "
                            + order.getOrderNumber() + ": " + escrowResult.getMessage());
                }
            }

            Result<Void> successResult = handleSuccessfulCheckout(userId, orders, pricing, acceptedOffer);
            if (successResult.isError()) {
                // Coupon already used or offer completed by a concurrent checkout: undo payments and orders.
                rollbackCheckout();
                checkoutStockReservationService.releaseReservedStock(userId, reserved);
                log.warn("Checkout finalization failed for orders {}: {}", orderNumbers, successResult.getErrorCode());
                return Result.error(successResult.getMessage(), successResult.getErrorCode());
            }
            for (Order order : orders) {
                checkoutStockReservationService.consumeReservationsOnSuccess(userId, order);
            }
            // If the commit itself fails, give the held units back now instead of after the TTL.
            checkoutStockReservationService.releaseReservedStockOnRollback(userId, reserved);
            for (Order order : orders) {
                eventPublisher.publishEvent(new OrderCreatedEvent(order, user, true));
            }
            log.info("Checkout completed successfully for orders: {}", orderNumbers);

            List<OrderDto> orderDtos = orders.stream().map(orderMapper::toDto).toList();
            BigDecimal totalAmount = orders.stream()
                    .map(Order::getTotalAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return Result.success(new CheckoutResultDto(orderDtos, totalAmount));

        } catch (RuntimeException e) {
            checkoutStockReservationService.releaseReservedStock(userId, reserved);
            log.error("Critical exception during checkout for orders: {}", orderNumbers, e);
            throw e;
        }
    }

    private void applyPaymentResultToOrder(Order order, List<PaymentDto> paymentResults,
                                           boolean allSuccessful, String providerName) {
        if (paymentResults != null && !paymentResults.isEmpty()) {
            order.setPaymentReference(paymentResults.get(0).paymentId().toString());
        }
        order.setPaymentStatus(allSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        if (allSuccessful) {
            order.setStatus(order.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP ? OrderStatus.MEETUP_PENDING : OrderStatus.CONFIRMED);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }
        order.setPaymentProviderName(providerName != null ? providerName : "EWALLET");
        if (allSuccessful && order.getShipping() != null) {
            order.getShipping().setStatus(ShippingStatus.PENDING);
        }
        orderRepository.save(order);
        log.info("Updated order {} payment status to: {} with payment method: {}",
                order.getOrderNumber(), order.getPaymentStatus(), order.getPaymentProviderName());
    }

    /**
     * Rolls back everything this checkout wrote (order, any payments already taken) while still
     * returning a business error. Marking the outer transaction rollback-only makes the commit a
     * silent rollback; without it a payment step that already marked the shared transaction would
     * turn the response into an UnexpectedRollbackException (500).
     */
    private void rollbackCheckout() {
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    }

    // A coupon is redeemed once per checkout, linked to the first order that received part of its discount.
    private Result<Void> handleSuccessfulCheckout(Long userId, List<Order> orders, PricingResultDto pricing, Offer acceptedOffer) {
        if (pricing.getCouponCode() != null) {
            Order couponOrder = orders.stream()
                    .filter(o -> o.getCouponCode() != null)
                    .findFirst()
                    .orElse(orders.get(0));
            Result<Void> redeemResult = couponService.redeem(pricing.getCouponCode(), userId, couponOrder);
            if (redeemResult.isError()) {
                return redeemResult;
            }
        }
        if (acceptedOffer != null) {
            Result<Void> offerResult = offerService.markCompleted(acceptedOffer);
            if (offerResult.isError()) {
                return offerResult;
            }
        }
        cartRepository.deleteByUserId(userId);
        return Result.success();
    }
}
