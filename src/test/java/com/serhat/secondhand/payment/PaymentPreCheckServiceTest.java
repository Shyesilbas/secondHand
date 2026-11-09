package com.serhat.secondhand.payment;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.application.IPaymentVerificationService;
import com.serhat.secondhand.payment.application.PaymentPreCheckService;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.payment.validator.PaymentValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentPreCheckServiceTest {

    private final IUserService userService = mock(IUserService.class);
    private final PaymentValidator paymentValidator = mock(PaymentValidator.class);
    private final PaymentValidationHelper validationHelper = mock(PaymentValidationHelper.class);
    private final IPaymentVerificationService verificationService = mock(IPaymentVerificationService.class);
    private final PaymentPreCheckService service =
            new PaymentPreCheckService(userService, paymentValidator, validationHelper, verificationService);

    @Test
    void missingVerificationCodeReturnsVerificationRequiredErrorCode() {
        User payer = new User();
        PaymentRequest request = PaymentRequest.builder()
                .amount(new BigDecimal("10.00"))
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .build();
        when(userService.findById(1L)).thenReturn(Result.success(payer));
        when(validationHelper.resolveToUser(any(), any())).thenReturn(null);
        when(paymentValidator.validatePaymentAgreements(request)).thenReturn(Result.success());
        when(verificationService.isVerificationRequired(null)).thenReturn(true);

        Result<PaymentPreCheckService.PreCheckContext> result = service.preCheck(1L, request);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED.getCode());
        verify(verificationService).generateAndSendVerification(payer);
    }
}
