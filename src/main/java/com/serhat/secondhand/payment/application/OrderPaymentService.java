package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.PaymentRequestMapper;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public Result<PaymentProcessingResult> processPaymentsForOrder(User user, List<Cart> cartItems,
                                                                   CheckoutRequest request, Order order,
                                                                   PricingResultDto pricing) {
        log.info("Processing payments for order: {}", order.getOrderNumber());

        List<PaymentRequest> paymentRequests = paymentRequestMapper.buildOrderPaymentRequests(
                user, cartItems, request, pricing, order.getOrderNumber());
        log.debug("Created {} payment requests for order", paymentRequests.size());

        Result<List<PaymentDto>> batchResult = processPaymentBatch(user.getId(), paymentRequests);

        if (batchResult.isError()) {
            log.error("Payment failed for order: {} - {}", order.getOrderNumber(), batchResult.getMessage());
            markOrderAsFailed(order);
            return Result.error(batchResult.getMessage(), batchResult.getErrorCode());
        }

        List<PaymentDto> paymentResults = batchResult.getData();
        boolean allSuccessful = paymentResults.stream().allMatch(PaymentDto::isSuccess);
        updateOrderPaymentStatus(order, paymentResults, allSuccessful, request.getPaymentType());

        return Result.success(new PaymentProcessingResult(paymentResults, allSuccessful));
    }

    private void updateOrderPaymentStatus(Order order, List<PaymentDto> paymentResults,
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

    public Result<List<PaymentDto>> processPaymentBatch(Long userId, List<PaymentRequest> paymentRequests) {
        if (paymentRequests == null || paymentRequests.isEmpty()) {
            return Result.error("Payment List cannot be empty.");
        }

        for (PaymentRequest request : paymentRequests) {
            Result<Void> validationResult = validatePurchaseRequest(request);
            if (validationResult.isError()) {
                return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
            }
        }

        List<PaymentDto> results = new ArrayList<>();
        for (PaymentRequest request : paymentRequests) {
            Result<PaymentDto> result = paymentProcessor.executeSinglePayment(userId, request);
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

    public record PaymentProcessingResult(List<PaymentDto> paymentResults, boolean allSuccessful) {}
}

