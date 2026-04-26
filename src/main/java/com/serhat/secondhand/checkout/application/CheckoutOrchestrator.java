package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.application.event.OrderCreatedEvent;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.application.OrderPaymentService;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.*;

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
    private final PaymentOrchestrator paymentOrchestrator;
    private final CheckoutPricingContextFactory checkoutPricingContextFactory;
    private final CheckoutStockReservationService checkoutStockReservationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Result<OrderDto> executeCheckout(Long userId, CheckoutRequest request) {
        log.info("Executing checkout for userId: {}", userId);

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

        Result<Map<UUID, Integer>> reservedResult = checkoutStockReservationService.reserveStock(effectiveCartItems);
        if (reservedResult.isError()) {
            return Result.error(reservedResult.getErrorCode(), reservedResult.getMessage());
        }

        Map<UUID, Integer> reserved = reservedResult.getData();

        Result<Order> orderResult = orderCreationService.createOrder(user, effectiveCartItems, request, pricing);
        if (orderResult.isError()) {
            checkoutStockReservationService.releaseReservedStock(reserved);
            return Result.error(orderResult.getErrorCode(), orderResult.getMessage());
        }

        Order order = orderResult.getData();

        try {
            Result<List<PaymentDto>> paymentResult = orderPaymentService.processPaymentsForOrder(
                    user, effectiveCartItems, request, order.getOrderNumber(), pricing);

            if (paymentResult.isError()) {
                markOrderAsFailed(order);
                checkoutStockReservationService.releaseReservedStock(reserved);
                return Result.error(paymentResult.getErrorCode(), paymentResult.getMessage());
            }

            List<PaymentDto> paymentResults = paymentResult.getData();
            boolean allSuccessful = paymentResults.stream().allMatch(PaymentDto::isSuccess);

            applyPaymentResultToOrder(order, paymentResults, allSuccessful, request.getPaymentType());

            if (allSuccessful) {
                try {
                    Result<Void> escrowResult = paymentOrchestrator.createEscrowsForOrder(order);
                    if (escrowResult.isError()) {
                        log.error("ESCROW_CREATION_FAILED for order {}: {}. Manual intervention required to create escrows.", 
                                order.getOrderNumber(), escrowResult.getMessage());
                        // We don't rollback because payment was successful. 
                        // The order is CONFIRMED but escrows are missing.
                    }
                } catch (Exception e) {
                    log.error("CRITICAL_ERROR during escrow creation for order {}. Manual intervention required.", 
                            order.getOrderNumber(), e);
                }
                
                handleSuccessfulCheckout(userId, order, pricing, acceptedOffer);
                eventPublisher.publishEvent(new OrderCreatedEvent(order, user, true));
                log.info("Checkout completed successfully for order: {}", order.getOrderNumber());
            } else {
                checkoutStockReservationService.releaseReservedStock(reserved);
                eventPublisher.publishEvent(new OrderCreatedEvent(order, user, false));
                log.warn("Checkout payment failed for order: {}", order.getOrderNumber());
                return Result.error("PAYMENT_FAILED", "Error occurred during checkout payment. Please try again later.");
            }

            return Result.success(orderMapper.toDto(order));

        } catch (Exception e) {
            checkoutStockReservationService.releaseReservedStock(reserved);
            log.error("Critical exception during checkout for order: {}", order.getOrderNumber(), e);
            throw e;
        }
    }

    private void applyPaymentResultToOrder(Order order, List<PaymentDto> paymentResults,
                                           boolean allSuccessful, PaymentType paymentType) {
        if (paymentResults != null && !paymentResults.isEmpty()) {
            order.setPaymentReference(paymentResults.get(0).paymentId().toString());
        }
        order.setPaymentStatus(allSuccessful ? Order.PaymentStatus.PAID : Order.PaymentStatus.FAILED);
        order.setStatus(allSuccessful ? Order.OrderStatus.CONFIRMED : Order.OrderStatus.CANCELLED);
        order.setPaymentMethod(paymentType != null ? paymentType : PaymentType.EWALLET);
        if (allSuccessful && order.getShipping() != null) {
            order.getShipping().setStatus(ShippingStatus.PENDING);
        }
        orderRepository.save(order);
        log.info("Updated order {} payment status to: {} with payment method: {}",
                order.getOrderNumber(), order.getPaymentStatus(), order.getPaymentMethod());
    }

    private void markOrderAsFailed(Order order) {
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.error("Order {} marked as failed due to payment error", order.getOrderNumber());
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
