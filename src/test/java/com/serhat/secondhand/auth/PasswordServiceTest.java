package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.PasswordService;
import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.core.verification.Verification;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserNotificationService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PasswordServiceTest {

    private final IUserService userService = mock(IUserService.class);
    private final IVerificationService verificationService = mock(IVerificationService.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final UserNotificationService notificationService = mock(UserNotificationService.class);
    private final StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOps = mock(ValueOperations.class);
    private PasswordService service;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        service = new PasswordService(userService, mock(TokenService.class), encoder,
                verificationService, notificationService, redisTemplate);
    }

    @Test
    void resetPassword_withNoAttemptsLeft_rejectsEvenWithCorrectCode() {
        User user = new User();
        user.setAccountStatus(AccountStatus.ACTIVE);
        when(userService.findByEmail("a@b.com")).thenReturn(Result.success(user));
        Verification verification = new Verification();
        verification.setCode("123456");
        verification.setVerificationAttemptLeft(0);
        when(verificationService.findLatestActiveVerification(user, CodeType.PASSWORD_RESET))
                .thenReturn(Optional.of(verification));

        Result<String> result = service.resetPassword(new ResetPasswordRequest("a@b.com", "123456", "NewPass123!", "NewPass123!"));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE.getCode());
        verify(userService, never()).update(any());
        verify(verificationService, never()).markVerificationAsUsed(any());
        verify(encoder, never()).encode(any());
    }

    @Test
    void resetPassword_unknownEmail_returnsSameErrorAsWrongCode() {
        when(userService.findByEmail("nobody@b.com")).thenReturn(Result.error("not found", "USER_NOT_FOUND"));

        Result<String> result = service.resetPassword(new ResetPasswordRequest("nobody@b.com", "123456", "NewPass123!", "NewPass123!"));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE.getCode());
    }

    @Test
    void forgotPassword_overLimit_returnsGenericSuccessWithoutSendingCode() {
        when(valueOps.increment(anyString())).thenReturn(4L);

        Result<String> result = service.forgotPassword(new ForgotPasswordRequest("a@b.com"));

        assertThat(result.isSuccess()).isTrue();
        verifyNoInteractions(userService, notificationService);
        verify(verificationService, never()).generateVerification(any(), any(), any());
    }

    @Test
    void forgotPassword_firstRequest_setsWindowAndSendsCode() {
        when(valueOps.increment(anyString())).thenReturn(1L);
        User user = new User();
        user.setAccountStatus(AccountStatus.ACTIVE);
        when(userService.findOptionalByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(verificationService.generateCode()).thenReturn("654321");

        Result<String> result = service.forgotPassword(new ForgotPasswordRequest("a@b.com"));

        assertThat(result.isSuccess()).isTrue();
        verify(redisTemplate).expire(anyString(), any(java.time.Duration.class));
        verify(notificationService).sendPasswordResetCodeNotification(user, "654321");
    }
}
