package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService implements IPaymentVerificationService{

    private final IVerificationService verificationService;
    private final UserService userService;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentVerificationMessageBuilder paymentVerificationMessageBuilder;

    public void initiatePaymentVerification(Long userId, InitiateVerificationRequest req) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new RuntimeException(userResult.getMessage());
        }
        User user = userResult.getData();

        log.info("Initiating payment verification for user: {}, transactionType: {}", user.getEmail(),
                req != null ? req.getTransactionType() : "NULL");

        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        PaymentTransactionType type = (req != null && req.getTransactionType() != null)
                ? req.getTransactionType() : PaymentTransactionType.ITEM_PURCHASE;

        String details = paymentVerificationMessageBuilder.buildPaymentDetails(user, type, req);

        try {
            paymentNotificationService.sendPaymentVerificationNotification(user, code, details);
            log.info("Payment verification notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", user.getEmail(), e);
            throw e;
        }
    }

    public Result<Void> validateOrGenerateVerification(User user, String code) {
        if (code == null || code.isBlank()) {
            String generatedCode = verificationService.generateCode();
            verificationService.generateVerification(user, generatedCode, CodeType.PAYMENT_VERIFICATION);
            paymentNotificationService.sendPaymentVerificationNotification(user, generatedCode, "Payment verification code generated.");
            return Result.error(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED.toString(), "Verification code is required.");
        }
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            return Result.error(PaymentErrorCodes.INVALID_VERIFICATION_CODE.toString(), "Invalid verification code.");
        }
        return Result.success();
    }
}