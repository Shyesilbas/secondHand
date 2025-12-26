package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.user.domain.entity.User;
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

    public OrderDto checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getEmail());
        return checkoutOrchestrator.executeCheckout(user, request);
    }
}

