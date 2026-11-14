package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.core.verification.Verification;
import com.serhat.secondhand.payment.dto.PaymentVerificationDto;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PaymentVerificationServiceTest {

    @Test
    void initiate_returnsTheStoredCodeExpiry() {
        IVerificationService verificationService = mock(IVerificationService.class);
        IUserService userService = mock(IUserService.class);
        PaymentVerificationService service = new PaymentVerificationService(verificationService, userService,
                mock(PaymentNotificationService.class), mock(PaymentVerificationMessageBuilder.class));
        User user = User.builder().id(3L).email("a@b.c").build();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(3);
        Verification verification = new Verification();
        verification.setCodeExpiresAt(expiresAt);
        when(userService.findById(3L)).thenReturn(Result.success(user));
        when(verificationService.generateCode()).thenReturn("123456");
        when(verificationService.generateVerification(eq(user), any(), eq(CodeType.PAYMENT_VERIFICATION))).thenReturn(verification);

        PaymentVerificationDto dto = service.initiatePaymentVerification(3L, null);

        assertThat(dto.expiresAt()).isEqualTo(expiresAt);
    }
}
