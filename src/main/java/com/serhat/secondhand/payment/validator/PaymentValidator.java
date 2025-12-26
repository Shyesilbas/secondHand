package com.serhat.secondhand.payment.validator;

import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
import com.serhat.secondhand.agreements.service.AgreementService;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentValidator {

    private final AgreementService agreementService;
    private final PaymentValidationHelper paymentValidationHelper;
    private final UserService userService;

    public void validatePaymentAgreements(PaymentRequest paymentRequest) {
        if (!paymentRequest.agreementsAccepted()) {
            throw new BusinessException(PaymentErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        var requiredAgreements = agreementService.getRequiredAgreements(AgreementGroup.ONLINE_PAYMENT);
        var acceptedAgreementIds = paymentRequest.acceptedAgreementIds();

        if (acceptedAgreementIds == null || acceptedAgreementIds.size() != requiredAgreements.size()) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AGREEMENT_COUNT);
        }

        var requiredAgreementIds = requiredAgreements.stream()
                .map(agreement -> agreement.getAgreementId())
                .toList();

        if (!acceptedAgreementIds.containsAll(requiredAgreementIds)) {
            throw new BusinessException(PaymentErrorCodes.REQUIRED_AGREEMENTS_NOT_ACCEPTED);
        }
    }

    public void validatePaymentRequest(PaymentRequest paymentRequest, User fromUser) {
        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);
        paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, toUser);
    }
}

