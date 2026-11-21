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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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

    @Test
    void clientMembershipPaymentWithAutoRenewalCodeStillRequiresAgreementsAndOtp() {
        User payer = new User();
        PaymentRequest request = membershipRequest().verificationCode("AUTO_RENEWAL").build();
        when(userService.findById(1L)).thenReturn(Result.success(payer));
        when(paymentValidator.validatePaymentAgreements(request)).thenReturn(Result.success());
        when(verificationService.isVerificationRequired("AUTO_RENEWAL")).thenReturn(false);
        when(verificationService.validateCode(eq(payer), eq("AUTO_RENEWAL")))
                .thenReturn(Result.error(PaymentErrorCodes.INVALID_VERIFICATION_CODE.toString(), "Invalid verification code."));

        Result<PaymentPreCheckService.PreCheckContext> result = service.preCheck(1L, request);

        assertThat(result.isError()).isTrue();
        verify(paymentValidator).validatePaymentAgreements(request);
        verify(verificationService).validateCode(payer, "AUTO_RENEWAL");
    }

    @Test
    void systemInitiatedMembershipRenewalSkipsAgreementsAndOtp() {
        User payer = new User();
        PaymentRequest request = membershipRequest().systemInitiated(true).build();
        when(userService.findById(1L)).thenReturn(Result.success(payer));
        when(validationHelper.validatePaymentRequest(any(), any(), any())).thenReturn(Result.success());

        Result<PaymentPreCheckService.PreCheckContext> result = service.preCheck(1L, request);

        assertThat(result.isSuccess()).isTrue();
        verify(paymentValidator, never()).validatePaymentAgreements(any());
        verify(verificationService, never()).validateCode(any(), any());
    }

    @Test
    void systemInitiatedFlagDoesNotSkipOtpForOtherTransactionTypes() {
        User payer = new User();
        PaymentRequest request = membershipRequest()
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .systemInitiated(true)
                .build();
        when(userService.findById(1L)).thenReturn(Result.success(payer));
        when(paymentValidator.validatePaymentAgreements(request)).thenReturn(Result.success());
        when(verificationService.isVerificationRequired(null)).thenReturn(true);

        Result<PaymentPreCheckService.PreCheckContext> result = service.preCheck(1L, request);

        assertThat(result.isError()).isTrue();
        verify(verificationService).generateAndSendVerification(payer);
    }

    private PaymentRequest.PaymentRequestBuilder membershipRequest() {
        return PaymentRequest.builder()
                .amount(new BigDecimal("100.00"))
                .currency("TRY")
                .providerName("EWALLET")
                .transactionType(PaymentTransactionType.MEMBERSHIP_PAYMENT);
    }
}
