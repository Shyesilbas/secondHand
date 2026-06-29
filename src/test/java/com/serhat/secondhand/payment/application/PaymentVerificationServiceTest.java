package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentVerificationServiceTest {

    private PaymentVerificationService verificationService;

    private IVerificationService coreVerificationService;
    private IUserService userService;
    private PaymentNotificationService paymentNotificationService;
    private PaymentVerificationMessageBuilder paymentVerificationMessageBuilder;

    private User user;

    @BeforeEach
    void setUp() {
        coreVerificationService = mock(IVerificationService.class);
        userService = mock(IUserService.class);
        paymentNotificationService = mock(PaymentNotificationService.class);
        paymentVerificationMessageBuilder = mock(PaymentVerificationMessageBuilder.class);

        verificationService = new PaymentVerificationService(
                coreVerificationService,
                userService,
                paymentNotificationService,
                paymentVerificationMessageBuilder
        );

        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
    }

    @Test
    void initiatePaymentVerification_ShouldThrowException_WhenUserNotFound() {
        when(userService.findById(1L)).thenReturn(Result.error("User not found", "USER_NOT_FOUND"));

        InitiateVerificationRequest req = new InitiateVerificationRequest();
        req.setTransactionType(PaymentTransactionType.ITEM_PURCHASE);

        assertThrows(BusinessException.class, () -> verificationService.initiatePaymentVerification(1L, req));
    }

    @Test
    void initiatePaymentVerification_ShouldGenerateAndSendCode_WhenUserExists() {
        when(userService.findById(1L)).thenReturn(Result.success(user));
        when(coreVerificationService.generateCode()).thenReturn("987654");
        when(paymentVerificationMessageBuilder.buildPaymentDetails(any(), any(), any())).thenReturn("Mock Details");

        InitiateVerificationRequest req = new InitiateVerificationRequest();
        req.setTransactionType(PaymentTransactionType.ITEM_PURCHASE);

        verificationService.initiatePaymentVerification(1L, req);

        verify(coreVerificationService).generateVerification(user, "987654", CodeType.PAYMENT_VERIFICATION);
        verify(paymentNotificationService).sendPaymentVerificationNotification(user, "987654", "Mock Details");
    }

    @Test
    void isVerificationRequired_ShouldReturnTrue_WhenCodeIsNull() {
        assertTrue(verificationService.isVerificationRequired(null));
        assertTrue(verificationService.isVerificationRequired(""));
        assertFalse(verificationService.isVerificationRequired("123456"));
    }

    @Test
    void generateAndSendVerification_ShouldGenerateAndSendCode() {
        when(coreVerificationService.generateCode()).thenReturn("111222");

        verificationService.generateAndSendVerification(user);

        verify(coreVerificationService).generateVerification(user, "111222", CodeType.PAYMENT_VERIFICATION);
        verify(paymentNotificationService).sendPaymentVerificationNotification(user, "111222", "Payment verification code generated.");
    }

    @Test
    void validateCode_ShouldReturnSuccess_WhenCodeIsValid() {
        when(coreVerificationService.validateVerificationCode(user, "111222", CodeType.PAYMENT_VERIFICATION)).thenReturn(true);

        Result<Void> result = verificationService.validateCode(user, "111222");

        assertTrue(result.isSuccess());
    }

    @Test
    void validateCode_ShouldReturnError_WhenCodeIsInvalid() {
        when(coreVerificationService.validateVerificationCode(user, "wrong_code", CodeType.PAYMENT_VERIFICATION)).thenReturn(false);

        Result<Void> result = verificationService.validateCode(user, "wrong_code");

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.INVALID_VERIFICATION_CODE.toString(), result.getMessage());
    }
}
