package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.dto.PaymentVerificationDto;
import com.serhat.secondhand.user.domain.entity.User;

public interface IPaymentVerificationService {

    PaymentVerificationDto initiatePaymentVerification(Long userId, InitiateVerificationRequest req);

    boolean isVerificationRequired(String code);

    void generateAndSendVerification(User user);

    Result<Void> validateCode(User user, String code);
}
