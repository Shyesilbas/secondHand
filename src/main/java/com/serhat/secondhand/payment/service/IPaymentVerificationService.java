package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;

public interface IPaymentVerificationService {

    void initiatePaymentVerification(Long userId, InitiateVerificationRequest req);

    Result<Void> validateOrGenerateVerification(User user, String code);


}
