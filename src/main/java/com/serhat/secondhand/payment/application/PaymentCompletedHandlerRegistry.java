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
        for (PaymentCompletedHandler handler : handlers) {
            if (handler == defaultHandler) {
                continue;
            }
            if (handler.supports(payment)) {
                return handler.handle(payment);
            }
        }
        return defaultHandler.handle(payment);
    }
}

