package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.core.verification.Verification;
import com.serhat.secondhand.payment.dto.PaymentVerificationDto;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.AfterEach;
import com.serhat.secondhand.core.redis.ExpiringCounter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PaymentVerificationServiceTest {

    private final IVerificationService verificationService = mock(IVerificationService.class);
    private final IUserService userService = mock(IUserService.class);
    private final Map<String, String> redis = new HashMap<>();
    private PaymentVerificationService service;
    private final User user = User.builder().id(3L).email("a@b.c").build();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> ops = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(ops);
        when(ops.get(anyString())).thenAnswer(inv -> redis.get(inv.<String>getArgument(0)));
        ExpiringCounter counter = mock(ExpiringCounter.class);
        when(counter.increment(anyString(), any(Duration.class))).thenAnswer(inv ->
                Long.parseLong(redis.merge(inv.getArgument(0), "1", (a, b) -> String.valueOf(Long.parseLong(a) + 1))));
        when(redisTemplate.delete(anyString())).thenAnswer(inv -> redis.remove(inv.<String>getArgument(0)) != null);
        service = new PaymentVerificationService(verificationService, userService,
                mock(PaymentNotificationService.class), mock(PaymentVerificationMessageBuilder.class), redisTemplate, counter);
    }

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.unbindResourceIfPossible(
                PaymentVerificationService.class.getName() + ".consumed:" + user.getId());
    }

    @Test
    void initiate_returnsTheStoredCodeExpiry() {
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(3);
        Verification verification = new Verification();
        verification.setCodeExpiresAt(expiresAt);
        when(userService.findById(3L)).thenReturn(Result.success(user));
        when(verificationService.generateCode()).thenReturn("123456");
        when(verificationService.generateVerification(eq(user), any(), eq(CodeType.PAYMENT_VERIFICATION))).thenReturn(verification);

        PaymentVerificationDto dto = service.initiatePaymentVerification(3L, null);

        assertThat(dto.expiresAt()).isEqualTo(expiresAt);
    }

    @Test
    void codeIsConsumedOnFirstUseAndRejectedInALaterRequest() {
        when(verificationService.consumeVerificationCode(user, "123456", CodeType.PAYMENT_VERIFICATION))
                .thenReturn(true, false);

        assertThat(service.validateCode(user, "123456").isSuccess()).isTrue();
        Result<Void> reuse = service.validateCode(user, "123456");

        assertThat(reuse.isError()).isTrue();
        assertThat(reuse.getErrorCode()).isEqualTo(PaymentErrorCodes.INVALID_VERIFICATION_CODE.getCode());
    }

    @Test
    void sameCodeIsAcceptedAgainForTheOtherPaymentsOfOneTransaction() {
        TransactionSynchronizationManager.initSynchronization();
        when(verificationService.consumeVerificationCode(user, "123456", CodeType.PAYMENT_VERIFICATION))
                .thenReturn(true, false);

        assertThat(service.validateCode(user, "123456").isSuccess()).isTrue();
        assertThat(service.validateCode(user, "123456").isSuccess()).isTrue();

        verify(verificationService, times(1)).consumeVerificationCode(user, "123456", CodeType.PAYMENT_VERIFICATION);
    }

    @Test
    void locksAfterMaxFailedAttemptsEvenWithTheCorrectCode() {
        when(verificationService.consumeVerificationCode(eq(user), anyString(), eq(CodeType.PAYMENT_VERIFICATION)))
                .thenReturn(false);
        for (int i = 0; i < PaymentVerificationService.MAX_FAILED_ATTEMPTS; i++) {
            assertThat(service.validateCode(user, "00000" + i).getErrorCode())
                    .isEqualTo(PaymentErrorCodes.INVALID_VERIFICATION_CODE.getCode());
        }

        Result<Void> locked = service.validateCode(user, "123456");

        assertThat(locked.getErrorCode()).isEqualTo(PaymentErrorCodes.PAYMENT_VERIFICATION_LOCKED.getCode());
        verify(verificationService, never()).consumeVerificationCode(user, "123456", CodeType.PAYMENT_VERIFICATION);
    }

    @Test
    void requestingANewCodeResetsTheFailedAttemptCounter() {
        when(verificationService.consumeVerificationCode(eq(user), anyString(), eq(CodeType.PAYMENT_VERIFICATION)))
                .thenReturn(false);
        for (int i = 0; i < PaymentVerificationService.MAX_FAILED_ATTEMPTS; i++) {
            service.validateCode(user, "00000" + i);
        }
        when(verificationService.generateCode()).thenReturn("654321");

        service.generateAndSendVerification(user);
        when(verificationService.consumeVerificationCode(user, "654321", CodeType.PAYMENT_VERIFICATION)).thenReturn(true);

        assertThat(service.validateCode(user, "654321").isSuccess()).isTrue();
    }
}
