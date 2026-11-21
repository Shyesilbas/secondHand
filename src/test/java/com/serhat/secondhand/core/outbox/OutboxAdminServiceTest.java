package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.order.outbox.OrderOutboxRepository;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxAdminServiceTest {

    @Mock private PaymentOutboxRepository paymentOutboxRepository;
    @Mock private OrderOutboxRepository orderOutboxRepository;
    @Mock private EscrowOutboxRepository escrowOutboxRepository;
    @InjectMocks private OutboxAdminService service;

    private UUID id;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
    }

    @Test
    void requeuesPaymentEventOnlyThroughPaymentRepository() {
        when(paymentOutboxRepository.requeueByIdAndStatus(any(), any(), any(), any())).thenReturn(1);

        Result<Void> result = service.requeueFailed(OutboxType.PAYMENT, id);

        assertTrue(result.isSuccess());
        verify(paymentOutboxRepository).requeueByIdAndStatus(
                org.mockito.ArgumentMatchers.eq(id), org.mockito.ArgumentMatchers.eq(OutboxStatus.FAILED),
                org.mockito.ArgumentMatchers.eq(OutboxStatus.PENDING), any(LocalDateTime.class));
        verifyNoInteractions(orderOutboxRepository, escrowOutboxRepository);
    }

    @Test
    void requeuesOrderEventOnlyThroughOrderRepository() {
        when(orderOutboxRepository.requeueByIdAndStatus(any(), any(), any(), any())).thenReturn(1);

        assertTrue(service.requeueFailed(OutboxType.ORDER, id).isSuccess());
        verifyNoInteractions(paymentOutboxRepository, escrowOutboxRepository);
    }

    @Test
    void requeuesEscrowEventOnlyThroughEscrowRepository() {
        when(escrowOutboxRepository.requeueByIdAndStatus(any(), any(), any(), any())).thenReturn(1);

        assertTrue(service.requeueFailed(OutboxType.ESCROW, id).isSuccess());
        verifyNoInteractions(paymentOutboxRepository, orderOutboxRepository);
    }

    @Test
    void failsFastWhenEventIsMissingOrNotFailed() {
        when(escrowOutboxRepository.requeueByIdAndStatus(any(), any(), any(), any())).thenReturn(0);

        Result<Void> result = service.requeueFailed(OutboxType.ESCROW, id);

        assertTrue(result.isError());
        assertEquals(OutboxErrorCodes.OUTBOX_EVENT_NOT_REQUEUEABLE.getCode(), result.getErrorCode());
    }
}
