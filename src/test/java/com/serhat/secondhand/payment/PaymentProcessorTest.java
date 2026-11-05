package com.serhat.secondhand.payment;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.application.PaymentPreCheckService;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.outbox.PaymentOutboxService;
import com.serhat.secondhand.payment.port.out.PaymentProviderPort;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
import com.serhat.secondhand.payment.util.PaymentRedisIdempotencyService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PaymentProcessorTest {

    private final PaymentProviderPort provider = mock(PaymentProviderPort.class);
    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final PaymentMapper paymentMapper = mock(PaymentMapper.class);
    private final PaymentPreCheckService preCheck = mock(PaymentPreCheckService.class);
    private final PaymentOutboxService outbox = mock(PaymentOutboxService.class);
    private final CacheManager cacheManager = mock(CacheManager.class);
    private final PaymentRedisIdempotencyService redisIdempotency = mock(PaymentRedisIdempotencyService.class);
    private final PaymentIdempotencyHelper idempotencyHelper = mock(PaymentIdempotencyHelper.class);
    private PaymentProcessor processor;

    private final User from = new User();
    private final User to = new User();
    private final PaymentRequest request = PaymentRequest.builder()
            .amount(BigDecimal.TEN).providerName("EWALLET").idempotencyKey("k1").build();

    @BeforeEach
    void setUp() {
        processor = new PaymentProcessor(List.of(provider), paymentRepository, paymentMapper,
                idempotencyHelper, preCheck, outbox, redisIdempotency, cacheManager);
        ReflectionTestUtils.setField(processor, "self", processor);
        when(idempotencyHelper.withIdempotencyKey(request, "k1")).thenReturn(request);
        when(redisIdempotency.claim(eq("k1"), anyString()))
                .thenReturn(PaymentRedisIdempotencyService.ClaimResult.ACQUIRED);

        when(paymentRepository.findByIdempotencyKeyAndFromUserId("k1", 1L)).thenReturn(Optional.empty());
        when(preCheck.preCheck(1L, request))
                .thenReturn(Result.success(new PaymentPreCheckService.PreCheckContext(from, to)));
        when(provider.supports("EWALLET")).thenReturn(true);
        when(provider.canProcess(from, to, BigDecimal.TEN)).thenReturn(true);
        when(paymentMapper.fromPaymentRequest(eq(request), eq(from), eq(to), any())).thenReturn(new Payment());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void providerFailure_returnsErrorAndSkipsOutbox() {
        when(provider.process(any(), any(), any(), any(), any())).thenReturn(
                PaymentResult.failure("Insufficient balance", BigDecimal.TEN, "EWALLET", null, 1L, 2L));

        Result<PaymentDto> result = processor.executePaymentWithTransaction(1L, request);

        assertThat(result.isError()).isTrue();
        assertThat(result.getMessage()).contains("Insufficient balance");
        verify(paymentRepository).save(any(Payment.class)); // failed attempt is still recorded
        verify(outbox, never()).enqueuePaymentCompleted(any());
    }

    @Test
    void providerSuccess_returnsDtoAndEnqueuesOutbox() {
        when(provider.process(any(), any(), any(), any(), any())).thenReturn(
                PaymentResult.success("tx1", BigDecimal.TEN, "EWALLET", null, 1L, 2L));

        Result<PaymentDto> result = processor.executePaymentWithTransaction(1L, request);

        assertThat(result.isSuccess()).isTrue();
        verify(outbox).enqueuePaymentCompleted(any(Payment.class));
    }

    @Test
    void withoutCallerTransaction_retriesSpringOptimisticLockFailureThenMarksCompleted() {
        when(provider.process(any(), any(), any(), any(), any()))
                .thenThrow(new ObjectOptimisticLockingFailureException(Payment.class, 1L))
                .thenReturn(PaymentResult.success("tx1", BigDecimal.TEN, "EWALLET", null, 1L, 2L));

        Result<PaymentDto> result = processor.executeSinglePayment(1L, request);

        assertThat(result.isSuccess()).isTrue();
        verify(provider, times(2)).process(any(), any(), any(), any(), any());
        verify(redisIdempotency).markCompleted(eq("k1"), anyString());
    }

    @Test
    void insideCallerTransaction_marksCompletedOnlyAfterCommit() {
        when(provider.process(any(), any(), any(), any(), any())).thenReturn(
                PaymentResult.success("tx1", BigDecimal.TEN, "EWALLET", null, 1L, 2L));
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            Result<PaymentDto> result = processor.executeSinglePayment(1L, request);

            assertThat(result.isSuccess()).isTrue();
            verify(redisIdempotency, never()).markCompleted(any(), any());

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_COMMITTED));
            verify(redisIdempotency).markCompleted(eq("k1"), anyString());
        } finally {
            TransactionSynchronizationManager.setActualTransactionActive(false);
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void insideCallerTransaction_releasesMarkerWhenCallerRollsBack() {
        when(provider.process(any(), any(), any(), any(), any())).thenReturn(
                PaymentResult.success("tx1", BigDecimal.TEN, "EWALLET", null, 1L, 2L));
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            processor.executeSinglePayment(1L, request);

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
            verify(redisIdempotency, never()).markCompleted(any(), any());
            verify(redisIdempotency).releaseIfPending(eq("k1"), anyString());
        } finally {
            TransactionSynchronizationManager.setActualTransactionActive(false);
            TransactionSynchronizationManager.clearSynchronization();
        }
    }
}
