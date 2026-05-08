package com.serhat.secondhand.payment.outbox;

import com.serhat.secondhand.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentOutboxService {

    public static final String EVENT_PAYMENT_COMPLETED = "PAYMENT_COMPLETED";

    private final PaymentOutboxRepository paymentOutboxRepository;

    public void enqueuePaymentCompleted(Payment payment) {
        PaymentOutboxEvent event = PaymentOutboxEvent.builder()
                .eventType(EVENT_PAYMENT_COMPLETED)
                .aggregateType("Payment")
                .aggregateId(payment.getId().toString())
                .payload(payment.getId().toString())
                .status(OutboxStatus.PENDING)
                .build();
        paymentOutboxRepository.save(event);
    }
}
