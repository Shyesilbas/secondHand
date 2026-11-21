package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.core.verification.repository.VerificationRepository;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificationServiceConsumeTest {

    @Mock
    private VerificationRepository verificationRepository;

    @InjectMocks
    private VerificationService verificationService;

    private final User user = User.builder().id(5L).build();

    @Test
    void matchingCodeIsMarkedUsedThroughTheLockedLookup() {
        Verification active = new Verification();
        active.setVerified(false);
        active.setCodeExpiresAt(LocalDateTime.now().plusMinutes(3));
        when(verificationRepository.findActiveVerificationForUpdate(eq(user), eq(CodeType.PAYMENT_VERIFICATION),
                eq("123456"), any())).thenReturn(Optional.of(active));

        boolean consumed = verificationService.consumeVerificationCode(user, "123456", CodeType.PAYMENT_VERIFICATION);

        assertThat(consumed).isTrue();
        assertThat(active.isVerified()).isTrue();
        verify(verificationRepository).save(active);
    }

    @Test
    void unknownCodeIsRejectedWithoutWriting() {
        when(verificationRepository.findActiveVerificationForUpdate(eq(user), eq(CodeType.PAYMENT_VERIFICATION),
                eq("000000"), any())).thenReturn(Optional.empty());

        boolean consumed = verificationService.consumeVerificationCode(user, "000000", CodeType.PAYMENT_VERIFICATION);

        assertThat(consumed).isFalse();
        verify(verificationRepository, never()).save(any());
    }
}
