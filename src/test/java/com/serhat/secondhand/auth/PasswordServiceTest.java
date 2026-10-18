package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.PasswordService;
import com.serhat.secondhand.auth.application.TokenService;
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
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PasswordServiceTest {

    @Test
    void resetPassword_withNoAttemptsLeft_rejectsEvenWithCorrectCode() {
        IUserService userService = mock(IUserService.class);
        IVerificationService verificationService = mock(IVerificationService.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        PasswordService service = new PasswordService(userService, mock(TokenService.class), encoder,
                verificationService, mock(UserNotificationService.class));

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
        assertThat(result.getErrorCode()).isEqualTo(AuthErrorCodes.TOO_MANY_VERIFICATION_ATTEMPTS.getCode());
        verify(userService, never()).update(any());
        verify(verificationService, never()).markVerificationAsUsed(any());
        verify(encoder, never()).encode(any());
    }
}
