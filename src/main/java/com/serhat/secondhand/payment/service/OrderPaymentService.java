package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.OrderPaymentMapper;
import com.serhat.secondhand.payment.mapper.PaymentRequestMapper;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderPaymentService {

    private final PaymentProcessor paymentProcessor;
    private final OrderRepository orderRepository;
    private final PaymentRequestMapper paymentRequestMapper;
    private final OrderPaymentMapper orderPaymentMapper;

    public PaymentProcessingResult processOrderPayments(User user, List<Cart> cartItems,
                                                      CheckoutRequest request, Order order, PricingResultDto pricing) {
        log.info("Processing payments for order: {}", order.getOrderNumber());

        try {
            List<PaymentRequest> paymentRequests = createPaymentRequests(user, cartItems, request, pricing, order);
            List<PaymentDto> paymentResults = processBatchPayments(paymentRequests);
                        
            boolean allPaymentsSuccessful = paymentResults.stream().allMatch(PaymentDto::isSuccess);
            updateOrderPaymentStatus(order, paymentResults, allPaymentsSuccessful, request.getPaymentType());

            return new PaymentProcessingResult(paymentResults, allPaymentsSuccessful);
            
        } catch (BusinessException e) {
            log.error("Payment failed for order: {} - {}", order.getOrderNumber(), e.getMessage());
            handlePaymentFailure(order, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected payment error for order: {}", order.getOrderNumber(), e);
            handlePaymentFailure(order, e);
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    private List<PaymentRequest> createPaymentRequests(User user, List<Cart> cartItems, CheckoutRequest request, PricingResultDto pricing, Order order) {
        List<PaymentRequest> paymentRequests = orderPaymentMapper.buildPaymentRequests(user, cartItems, request, pricing, paymentRequestMapper, order.getOrderNumber());
        log.debug("Created {} payment requests for order", paymentRequests.size());
        return paymentRequests;
    }

    private void updateOrderPaymentStatus(Order order, List<PaymentDto> paymentResults, boolean allSuccessful, PaymentType paymentType) {
        orderPaymentMapper.updateOrderPaymentStatus(order, paymentResults, allSuccessful, paymentType);
        orderRepository.save(order);
        log.info("Updated order {} payment status to: {} with payment method: {}", 
                order.getOrderNumber(), order.getPaymentStatus(), order.getPaymentMethod());
    }

    private void handlePaymentFailure(Order order, Exception exception) {
        orderPaymentMapper.markOrderAsFailed(order);
        orderRepository.save(order);
        log.error("Order {} marked as failed due to payment error", order.getOrderNumber());
    }


    private List<PaymentDto> processBatchPayments(List<PaymentRequest> paymentRequests) {
        if (paymentRequests == null || paymentRequests.isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.EMPTY_PAYMENT_BATCH);
        }

        for (PaymentRequest request : paymentRequests) {
            validatePurchaseRequest(request);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return paymentRequests.stream()
                .map(request -> paymentProcessor.process(request, authentication))
                .toList();
    }

    private void validatePurchaseRequest(PaymentRequest request) {
        if (request.transactionType() != PaymentTransactionType.ITEM_PURCHASE) {
            throw new BusinessException(PaymentErrorCodes.INVALID_TXN_TYPE);
        }
        if (request.paymentDirection() != PaymentDirection.OUTGOING) {
            throw new BusinessException(PaymentErrorCodes.INVALID_DIRECTION);
        }
    }


        public record PaymentProcessingResult(List<PaymentDto> paymentResults, boolean allSuccessful) {

    }
}

