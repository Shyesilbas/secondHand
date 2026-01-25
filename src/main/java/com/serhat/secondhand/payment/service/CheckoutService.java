package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CheckoutService {

    private final CheckoutOrchestrator checkoutOrchestrator;

    public Result<OrderDto> checkout(Long userId, CheckoutRequest request) {
        log.info("Processing checkout for userId: {}", userId);

        Result<OrderDto> result = checkoutOrchestrator.executeCheckout(userId, request);

        if (result.isError()) {
            log.warn("Checkout failed for user {}: {}", userId, result.getMessage());
            return Result.error(result.getErrorCode(), result.getMessage());
        }

        return result;
    }
}