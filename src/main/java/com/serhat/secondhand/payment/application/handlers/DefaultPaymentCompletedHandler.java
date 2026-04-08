package com.serhat.secondhand.payment.application.handlers;

import com.serhat.secondhand.payment.application.PaymentCompletedHandleResult;
import com.serhat.secondhand.payment.application.PaymentCompletedHandler;
import com.serhat.secondhand.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class DefaultPaymentCompletedHandler implements PaymentCompletedHandler {

    @Override
    public boolean supports(Payment payment) {
        return true;
    }

    @Override
    public PaymentCompletedHandleResult handle(Payment payment) {
        return PaymentCompletedHandleResult.empty();
    }
}

