package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.payment.validator.PaymentValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentPreCheckServiceTest {

    private PaymentPreCheckService preCheckService;

    private IUserService userService;
    private PaymentValidator paymentValidator;
    private PaymentValidationHelper paymentValidationHelper;
    private IPaymentVerificationService paymentVerificationService;

    private User fromUser;
    private User toUser;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        userService = mock(IUserService.class);
        paymentValidator = mock(PaymentValidator.class);
        paymentValidationHelper = mock(PaymentValidationHelper.class);
        paymentVerificationService = mock(IPaymentVerificationService.class);

        preCheckService = new PaymentPreCheckService(
                userService,
                paymentValidator,
                paymentValidationHelper,
                paymentVerificationService
        );

        fromUser = new User();
        fromUser.setId(1L);
        fromUser.setEmail("buyer@test.com");

        toUser = new User();
        toUser.setId(2L);
        toUser.setEmail("seller@test.com");

        paymentRequest = PaymentRequest.builder()
                .fromUserId(1L)
                .toUserId(2L)
                .amount(BigDecimal.TEN)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .verificationCode("123456")
                .build();
    }

    @Test
    void preCheck_ShouldReturnError_WhenUserNotFound() {
        when(userService.findById(1L)).thenReturn(Result.error("User not found", "USER_NOT_FOUND"));

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals("USER_NOT_FOUND", result.getMessage());
    }

    @Test
    void preCheck_ShouldBypassVerificationAndAgreements_WhenAutoRenewal() {
        paymentRequest = PaymentRequest.builder()
                .fromUserId(1L)
                .toUserId(null)
                .amount(BigDecimal.TEN)
                .transactionType(PaymentTransactionType.MEMBERSHIP_PAYMENT)
                .verificationCode("AUTO_RENEWAL")
                .build();

        when(userService.findById(1L)).thenReturn(Result.success(fromUser));
        when(paymentValidationHelper.resolveToUser(paymentRequest, userService)).thenReturn(null);
        when(paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, null)).thenReturn(Result.success());

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isSuccess());
        assertEquals(fromUser, result.getData().fromUser());
        assertNull(result.getData().toUser());
        verifyNoInteractions(paymentValidator, paymentVerificationService);
    }

    @Test
    void preCheck_ShouldReturnError_WhenAgreementsValidationFails() {
        when(userService.findById(1L)).thenReturn(Result.success(fromUser));
        when(paymentValidator.validatePaymentAgreements(paymentRequest)).thenReturn(Result.error("Agreements required", "AGREEMENTS_REQUIRED"));

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals("AGREEMENTS_REQUIRED", result.getMessage());
    }

    @Test
    void preCheck_ShouldTriggerVerificationAndReturnError_WhenCodeIsEmpty() {
        paymentRequest = PaymentRequest.builder()
                .fromUserId(1L)
                .toUserId(2L)
                .amount(BigDecimal.TEN)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .verificationCode("")
                .build();

        when(userService.findById(1L)).thenReturn(Result.success(fromUser));
        when(paymentValidator.validatePaymentAgreements(paymentRequest)).thenReturn(Result.success());
        when(paymentVerificationService.isVerificationRequired("")).thenReturn(true);

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED.toString(), result.getMessage());
        verify(paymentVerificationService).generateAndSendVerification(fromUser);
    }

    @Test
    void preCheck_ShouldReturnError_WhenVerificationCodeIsInvalid() {
        when(userService.findById(1L)).thenReturn(Result.success(fromUser));
        when(paymentValidator.validatePaymentAgreements(paymentRequest)).thenReturn(Result.success());
        when(paymentVerificationService.isVerificationRequired("123456")).thenReturn(false);
        when(paymentVerificationService.validateCode(fromUser, "123456")).thenReturn(Result.error("Invalid code", "INVALID_CODE"));

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals("INVALID_CODE", result.getMessage());
    }

    @Test
    void preCheck_ShouldReturnError_WhenRequestValidationFails() {
        when(userService.findById(1L)).thenReturn(Result.success(fromUser));
        when(paymentValidationHelper.resolveToUser(paymentRequest, userService)).thenReturn(toUser);
        when(paymentValidator.validatePaymentAgreements(paymentRequest)).thenReturn(Result.success());
        when(paymentVerificationService.isVerificationRequired("123456")).thenReturn(false);
        when(paymentVerificationService.validateCode(fromUser, "123456")).thenReturn(Result.success());
        when(paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, toUser)).thenReturn(Result.error("Invalid request details", "INVALID_DETAILS"));

        Result<PaymentPreCheckService.PreCheckContext> result = preCheckService.preCheck(1L, paymentRequest);

        assertTrue(result.isError());
        assertEquals("INVALID_DETAILS", result.getMessage());
    }
}
