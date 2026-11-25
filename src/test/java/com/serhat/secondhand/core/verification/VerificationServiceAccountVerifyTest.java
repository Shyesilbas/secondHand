package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.repository.VerificationRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.util.UserErrorCodes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationServiceAccountVerifyTest {

    @Mock
    private VerificationRepository verificationRepository;
    @Mock
    private IUserService userService;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private VerificationService verificationService;

    @Test
    void lastWrongAttemptBurnsTheCodeButNeverBlocksTheAccount() {
        User user = User.builder().id(5L).accountStatus(AccountStatus.ACTIVE).build();
        Verification active = new Verification();
        active.setCode("111111");
        active.setVerificationAttemptLeft(1);
        active.setVerified(false);
        active.setCodeExpiresAt(LocalDateTime.now().plusMinutes(3));
        when(userService.getAuthenticatedUser(authentication)).thenReturn(user);
        when(verificationRepository.findTopByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfterOrderByCreatedAtDesc(
                eq(user), eq(CodeType.ACCOUNT_VERIFICATION), any())).thenReturn(Optional.of(active));

        Result<Void> result = verificationService.verifyUser(new VerificationRequest("999999"), authentication);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(UserErrorCodes.VERIFICATION_ATTEMPTS_EXHAUSTED.getCode());
        assertThat(active.isVerified()).isTrue();
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        verify(userService, never()).update(any());
    }
}
