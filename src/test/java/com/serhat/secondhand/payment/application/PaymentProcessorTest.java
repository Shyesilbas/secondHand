package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.outbox.PaymentOutboxService;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.strategy.PaymentStrategy;
import com.serhat.secondhand.payment.strategy.PaymentStrategyFactory;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
import com.serhat.secondhand.payment.util.PaymentRedisIdempotencyService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentProcessorTest {

    private PaymentProcessor processor;

    private PaymentStrategyFactory paymentStrategyFactory;
    private PaymentRepository paymentRepository;
    private PaymentMapper paymentMapper;
    private PaymentIdempotencyHelper paymentIdempotencyHelper;
    private PaymentPreCheckService paymentPreCheckService;
    private PaymentOutboxService paymentOutboxService;
    private PaymentRedisIdempotencyService paymentRedisIdempotencyService;
    private CacheManager cacheManager;

    private User fromUser;
    private User toUser;
    private PaymentRequest paymentRequest;
    private Payment payment;
    private PaymentDto paymentDto;

    @BeforeEach
    void setUp() throws Exception {
        paymentStrategyFactory = mock(PaymentStrategyFactory.class);
        paymentRepository = mock(PaymentRepository.class);
        paymentMapper = mock(PaymentMapper.class);
        paymentIdempotencyHelper = mock(PaymentIdempotencyHelper.class);
        paymentPreCheckService = mock(PaymentPreCheckService.class);
        paymentOutboxService = mock(PaymentOutboxService.class);
        paymentRedisIdempotencyService = mock(PaymentRedisIdempotencyService.class);
        cacheManager = mock(CacheManager.class);

        processor = new PaymentProcessor(
                paymentStrategyFactory,
                paymentRepository,
                paymentMapper,
                paymentIdempotencyHelper,
                paymentPreCheckService,
                paymentOutboxService,
                paymentRedisIdempotencyService,
                cacheManager
        );

        // Inject the self-reference field using reflection
        java.lang.reflect.Field field = PaymentProcessor.class.getDeclaredField("self");
        field.setAccessible(true);
        field.set(processor, processor);

        fromUser = new User();
        fromUser.setId(1L);

        toUser = new User();
        toUser.setId(2L);

        paymentRequest = PaymentRequest.builder()
                .fromUserId(1L)
                .toUserId(2L)
                .amount(BigDecimal.TEN)
                .paymentType(PaymentType.EWALLET)
                .idempotencyKey("idem-111")
                .build();

        payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setAmount(BigDecimal.TEN);
        payment.setPaymentType(PaymentType.EWALLET);
        payment.setFromUser(fromUser);
        payment.setToUser(toUser);

        paymentDto = mock(PaymentDto.class);

        when(paymentIdempotencyHelper.buildIdempotencyKey(any(), any())).thenReturn("idem-111");
        when(paymentIdempotencyHelper.withIdempotencyKey(any(), any())).thenReturn(paymentRequest);
    }

    @Test
    void executeSinglePayment_ShouldReturnConflict_WhenRedisClaimConflict() {
        when(paymentRedisIdempotencyService.claim("idem-111", "1|EWALLET|10|null|null")).thenReturn(PaymentRedisIdempotencyService.ClaimResult.CONFLICT);

        Result<PaymentDto> result = processor.executeSinglePayment(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString(), result.getErrorCode());
    }

    @Test
    void executeSinglePayment_ShouldReturnInProgress_WhenRedisClaimInProgress() {
        when(paymentRedisIdempotencyService.claim("idem-111", "1|EWALLET|10|null|null")).thenReturn(PaymentRedisIdempotencyService.ClaimResult.IN_PROGRESS);

        Result<PaymentDto> result = processor.executeSinglePayment(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString(), result.getErrorCode());
    }

    @Test
    void executeSinglePayment_ShouldReturnExistingPayment_WhenRedisClaimAlreadyCompleted() {
        when(paymentRedisIdempotencyService.claim("idem-111", "1|EWALLET|10|null|null")).thenReturn(PaymentRedisIdempotencyService.ClaimResult.ALREADY_COMPLETED);
        when(paymentRepository.findByIdempotencyKeyAndFromUserId("idem-111", 1L)).thenReturn(Optional.of(payment));
        when(paymentMapper.toDto(payment)).thenReturn(paymentDto);

        Result<PaymentDto> result = processor.executeSinglePayment(1L, paymentRequest);

        assertTrue(result.isSuccess());
        assertEquals(paymentDto, result.getData());
    }

    @Test
    void executeSinglePayment_ShouldProcessSuccessfully_WhenAcquiredLock() {
        when(paymentRedisIdempotencyService.claim("idem-111", "1|EWALLET|10|null|null")).thenReturn(PaymentRedisIdempotencyService.ClaimResult.ACQUIRED);
        
        PaymentPreCheckService.PreCheckContext context = new PaymentPreCheckService.PreCheckContext(fromUser, toUser);
        when(paymentPreCheckService.preCheck(1L, paymentRequest)).thenReturn(Result.success(context));

        PaymentStrategy strategy = mock(PaymentStrategy.class);
        when(paymentStrategyFactory.getStrategy(PaymentType.EWALLET)).thenReturn(strategy);
        when(strategy.canProcess(fromUser, toUser, BigDecimal.TEN)).thenReturn(true);

        UUID listingId = UUID.randomUUID();
        PaymentResult paymentResult = PaymentResult.success("ref-999", BigDecimal.TEN, PaymentType.EWALLET, listingId, 1L, 2L);
        when(strategy.process(eq(fromUser), eq(toUser), eq(BigDecimal.TEN), any(), eq(paymentRequest))).thenReturn(paymentResult);

        when(paymentMapper.fromPaymentRequest(paymentRequest, fromUser, toUser, paymentResult)).thenReturn(payment);
        when(paymentRepository.save(payment)).thenReturn(payment);
        when(paymentMapper.toDto(payment)).thenReturn(paymentDto);

        Cache cache = mock(Cache.class);
        when(cacheManager.getCache("paymentStats")).thenReturn(cache);

        Result<PaymentDto> result = processor.executeSinglePayment(1L, paymentRequest);

        assertTrue(result.isSuccess());
        assertEquals(paymentDto, result.getData());
        verify(paymentRedisIdempotencyService).markCompleted("idem-111", "1|EWALLET|10|null|null");
        verify(paymentOutboxService).enqueuePaymentCompleted(payment);
        verify(cache).evict("1_null");
    }

    @Test
    void executeSinglePayment_ShouldRetryAndSucceed_WhenOptimisticLockExceptionThrown() {
        when(paymentRedisIdempotencyService.claim("idem-111", "1|EWALLET|10|null|null")).thenReturn(PaymentRedisIdempotencyService.ClaimResult.ACQUIRED);

        // Spy processor to inject custom mock calls or use mock/reflection self reference
        PaymentProcessor spyProcessor = spy(processor);
        
        // We'll throw OptimisticLockException on first call, and return success on the second call.
        doThrow(new OptimisticLockException("lock error"))
                .doReturn(Result.success(paymentDto))
                .when(spyProcessor).executePaymentWithTransaction(1L, paymentRequest);

        // Setup self field on spy
        try {
            java.lang.reflect.Field field = PaymentProcessor.class.getDeclaredField("self");
            field.setAccessible(true);
            field.set(spyProcessor, spyProcessor);
        } catch (Exception e) {
            fail(e);
        }

        Result<PaymentDto> result = spyProcessor.executeSinglePayment(1L, paymentRequest);

        assertTrue(result.isSuccess());
        assertEquals(paymentDto, result.getData());
        verify(spyProcessor, times(2)).executePaymentWithTransaction(1L, paymentRequest);
    }
}
