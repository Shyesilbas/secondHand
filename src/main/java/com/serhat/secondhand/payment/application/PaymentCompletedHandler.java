package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.entity.Payment;

public interface PaymentCompletedHandler {

    boolean supports(Payment payment);

    PaymentCompletedHandleResult handle(Payment payment);
}

