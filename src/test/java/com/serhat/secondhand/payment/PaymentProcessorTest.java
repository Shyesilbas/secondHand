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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentProcessorTest {

    private final PaymentProviderPort provider = mock(PaymentProviderPort.class);
    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final PaymentMapper paymentMapper = mock(PaymentMapper.class);
    private final PaymentPreCheckService preCheck = mock(PaymentPreCheckService.class);
    private final PaymentOutboxService outbox = mock(PaymentOutboxService.class);
    private final CacheManager cacheManager = mock(CacheManager.class);
    private PaymentProcessor processor;

    private final User from = new User();
    private final User to = new User();
    private final PaymentRequest request = PaymentRequest.builder()
            .amount(BigDecimal.TEN).providerName("EWALLET").idempotencyKey("k1").build();

    @BeforeEach
    void setUp() {
        processor = new PaymentProcessor(List.of(provider), paymentRepository, paymentMapper,
                mock(PaymentIdempotencyHelper.class), preCheck, outbox,
                mock(PaymentRedisIdempotencyService.class), cacheManager);

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
}
