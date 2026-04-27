package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Ödeme işlemlerini yürütür. Sipariş entity'sini mutate etmez;
 * sonuç CheckoutOrchestrator tarafından sipariş durumuna yansıtılır.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderPaymentService {

    private final PaymentProcessor paymentProcessor;
    private final PaymentRequestFactory paymentRequestFactory;

    public Result<List<PaymentDto>> processPaymentsForOrder(User user, List<Cart> cartItems,
                                                            CheckoutRequest request, String orderNumber,
                                                            PricingResultDto pricing, java.util.UUID orderExternalId) {
        log.info("Processing payments for order: {}", orderNumber);

        List<PaymentRequest> paymentRequests = paymentRequestFactory.buildOrderPaymentRequests(
                user, cartItems, request, pricing, orderNumber, orderExternalId);
        log.debug("Created {} payment requests for order", paymentRequests.size());

        return processPaymentBatch(user.getId(), paymentRequests);
    }

    public Result<List<PaymentDto>> processPaymentBatch(Long userId, List<PaymentRequest> paymentRequests) {
        if (paymentRequests == null || paymentRequests.isEmpty()) {
            return Result.error("Payment list cannot be empty.");
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
}
