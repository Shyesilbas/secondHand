package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.payment.validator.PaymentValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentPreCheckService {

    private final IUserService userService;
    private final PaymentValidator paymentValidator;
    private final PaymentValidationHelper paymentValidationHelper;
    private final IPaymentVerificationService paymentVerificationService;

    public Result<PaymentPreCheckContext> preCheck(Long userId, PaymentRequest paymentRequest) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }

        User fromUser = userResult.getData();
        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);

        Result<Void> agreementsResult = paymentValidator.validatePaymentAgreements(paymentRequest);
        if (agreementsResult.isError()) {
            return Result.error(agreementsResult.getErrorCode(), agreementsResult.getMessage());
        }

        Result<Void> verificationResult = paymentVerificationService.validateOrGenerateVerification(fromUser, paymentRequest.verificationCode());
        if (verificationResult.isError()) {
            return Result.error(verificationResult.getErrorCode(), verificationResult.getMessage());
        }

        Result<Void> requestValidationResult = paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, toUser);
        if (requestValidationResult.isError()) {
            return Result.error(requestValidationResult.getErrorCode(), requestValidationResult.getMessage());
        }

        return Result.success(new PaymentPreCheckContext(fromUser, toUser));
    }
}

