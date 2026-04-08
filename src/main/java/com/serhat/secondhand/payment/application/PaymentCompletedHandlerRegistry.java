package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.application.handlers.DefaultPaymentCompletedHandler;
import com.serhat.secondhand.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentCompletedHandlerRegistry {

    private final List<PaymentCompletedHandler> handlers;
    private final DefaultPaymentCompletedHandler defaultHandler;

    public PaymentCompletedHandleResult handle(Payment payment) {
        return handlers.stream()
                .filter(h -> h != defaultHandler && h.supports(payment))
                .findFirst()
                .orElse(defaultHandler)
                .handle(payment);
    }
}
