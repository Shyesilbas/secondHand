package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.order.outbox.OrderOutboxRepository;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxMetricsTest {

    @Mock private PaymentOutboxRepository paymentOutboxRepository;
    @Mock private OrderOutboxRepository orderOutboxRepository;
    @Mock private EscrowOutboxRepository escrowOutboxRepository;
    @InjectMocks private OutboxMetrics metrics;

    @Test
    void exposesPendingAndFailedCountsPerOutbox() {
        when(paymentOutboxRepository.countByStatus(OutboxStatus.FAILED)).thenReturn(3L);
        when(paymentOutboxRepository.countByStatus(OutboxStatus.PENDING)).thenReturn(5L);
        when(orderOutboxRepository.countByStatus(OutboxStatus.FAILED)).thenReturn(0L);
        when(orderOutboxRepository.countByStatus(OutboxStatus.PENDING)).thenReturn(0L);
        when(escrowOutboxRepository.countByStatus(OutboxStatus.FAILED)).thenReturn(2L);
        when(escrowOutboxRepository.countByStatus(OutboxStatus.PENDING)).thenReturn(1L);

        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        metrics.bindTo(registry);

        assertEquals(3.0, gauge(registry, "payment", "FAILED"));
        assertEquals(5.0, gauge(registry, "payment", "PENDING"));
        assertEquals(0.0, gauge(registry, "order", "FAILED"));
        assertEquals(0.0, gauge(registry, "order", "PENDING"));
        assertEquals(2.0, gauge(registry, "escrow", "FAILED"));
        assertEquals(1.0, gauge(registry, "escrow", "PENDING"));
    }

    private static double gauge(SimpleMeterRegistry registry, String outbox, String status) {
        return registry.get(OutboxMetrics.METRIC_NAME).tag("outbox", outbox).tag("status", status).gauge().value();
    }
}
