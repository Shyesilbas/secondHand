package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService implements IPaymentVerificationService {

    private final IVerificationService verificationService;
    private final IUserService userService;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentVerificationMessageBuilder paymentVerificationMessageBuilder;

    @Override
    public void initiatePaymentVerification(Long userId, InitiateVerificationRequest req) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new BusinessException(userResult.getMessage(), org.springframework.http.HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
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

    @Override
    public boolean isVerificationRequired(String code) {
        return code == null || code.isBlank();
    }

    @Override
    public void generateAndSendVerification(User user) {
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);
        paymentNotificationService.sendPaymentVerificationNotification(user, code, "Payment verification code generated.");
        log.info("Payment verification code generated and sent to user: {}", user.getEmail());
    }

    @Override
    public Result<Void> validateCode(User user, String code) {
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            return Result.error(PaymentErrorCodes.INVALID_VERIFICATION_CODE.toString(), "Invalid verification code.");
        }
        return Result.success();
    }
}
