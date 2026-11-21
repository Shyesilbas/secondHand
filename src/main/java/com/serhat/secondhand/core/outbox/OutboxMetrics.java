package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.order.outbox.OrderOutboxRepository;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

/**
 * Exposes the number of {@code PENDING} and {@code FAILED} outbox rows per outbox as the gauge
 * {@code secondhand.outbox.events} (Prometheus: {@code secondhand_outbox_events}), so a stuck money event can be alerted on
 * (for example {@code status="FAILED"} above zero) instead of being found only in logs.
 */
@Component
@RequiredArgsConstructor
public class OutboxMetrics implements MeterBinder {

    public static final String METRIC_NAME = "secondhand.outbox.events";

    private final PaymentOutboxRepository paymentOutboxRepository;
    private final OrderOutboxRepository orderOutboxRepository;
    private final EscrowOutboxRepository escrowOutboxRepository;

    @Override
    public void bindTo(MeterRegistry registry) {
        for (OutboxStatus status : new OutboxStatus[]{OutboxStatus.PENDING, OutboxStatus.FAILED}) {
            register(registry, OutboxType.PAYMENT, status, () -> paymentOutboxRepository.countByStatus(status));
            register(registry, OutboxType.ORDER, status, () -> orderOutboxRepository.countByStatus(status));
            register(registry, OutboxType.ESCROW, status, () -> escrowOutboxRepository.countByStatus(status));
        }
    }

    private static void register(MeterRegistry registry, OutboxType type, OutboxStatus status, Supplier<Long> count) {
        // Supplier overload keeps a strong reference; the (obj, function) overload would let the lambda be garbage collected
        Gauge.builder(METRIC_NAME, (Supplier<Number>) count::get)
                .description("Outbox rows by outbox and status")
                .tag("outbox", type.name().toLowerCase())
                .tag("status", status.name())
                .register(registry);
    }
}
