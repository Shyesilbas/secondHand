package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
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

import java.util.ArrayList;
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

    public Result<PaymentProcessingResult> processOrderPayments(User user, List<Cart> cartItems,
                                                      CheckoutRequest request, Order order, PricingResultDto pricing) {
        log.info("Processing payments for order: {}", order.getOrderNumber());

        List<PaymentRequest> paymentRequests = createPaymentRequests(user, cartItems, request, pricing, order);
        Result<List<PaymentDto>> batchResult = processBatchPayments(paymentRequests);
        
        if (batchResult.isError()) {
            log.error("Payment failed for order: {} - {}", order.getOrderNumber(), batchResult.getMessage());
            handlePaymentFailure(order);
            return Result.error(batchResult.getMessage(), batchResult.getErrorCode());
        }
        
        List<PaymentDto> paymentResults = batchResult.getData();
        boolean allPaymentsSuccessful = paymentResults.stream().allMatch(PaymentDto::isSuccess);
        updateOrderPaymentStatus(order, paymentResults, allPaymentsSuccessful, request.getPaymentType());

        return Result.success(new PaymentProcessingResult(paymentResults, allPaymentsSuccessful));
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

    private void handlePaymentFailure(Order order) {
        orderPaymentMapper.markOrderAsFailed(order);
        orderRepository.save(order);
        log.error("Order {} marked as failed due to payment error", order.getOrderNumber());
    }


    @Transactional
    protected Result<List<PaymentDto>> processBatchPayments(List<PaymentRequest> paymentRequests) {
        if (paymentRequests == null || paymentRequests.isEmpty()) {
            return Result.error(PaymentErrorCodes.EMPTY_PAYMENT_BATCH);
        }

        for (PaymentRequest request : paymentRequests) {
            Result<Void> validationResult = validatePurchaseRequest(request);
            if (validationResult.isError()) {
                return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
            }
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<PaymentDto> results = new ArrayList<>();
        for (PaymentRequest request : paymentRequests) {
            Result<PaymentDto> result = paymentProcessor.process(request, authentication);
            if (result.isError()) {
                return Result.error(result.getMessage(), result.getErrorCode());
            }
            results.add(result.getData());
        }
        return Result.success(results);
    }

    private Result<Void> validatePurchaseRequest(PaymentRequest request) {
        if (request.transactionType() != PaymentTransactionType.ITEM_PURCHASE) {
            return Result.error(PaymentErrorCodes.INVALID_TXN_TYPE);
        }
        if (request.paymentDirection() != PaymentDirection.OUTGOING) {
            return Result.error(PaymentErrorCodes.INVALID_DIRECTION);
        }
        return Result.success();
    }


        public record PaymentProcessingResult(List<PaymentDto> paymentResults, boolean allSuccessful) {

    }
}

