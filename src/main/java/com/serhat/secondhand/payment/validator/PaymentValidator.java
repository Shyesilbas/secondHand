package com.serhat.secondhand.payment.validator;

import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
import com.serhat.secondhand.agreements.service.AgreementService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.user.application.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentValidator {

    private final AgreementService agreementService;
    private final PaymentValidationHelper paymentValidationHelper;
    private final UserService userService;

    public Result<Void> validatePaymentAgreements(PaymentRequest paymentRequest) {
        if (!paymentRequest.agreementsAccepted()) {
            return Result.error(PaymentErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        var requiredAgreements = agreementService.getRequiredAgreements(AgreementGroup.ONLINE_PAYMENT);
        var acceptedAgreementIds = paymentRequest.acceptedAgreementIds();

        if (acceptedAgreementIds == null || acceptedAgreementIds.size() != requiredAgreements.size()) {
            return Result.error(PaymentErrorCodes.INVALID_AGREEMENT_COUNT);
        }

        var requiredAgreementIds = requiredAgreements.stream()
                .map(agreement -> agreement.getAgreementId())
                .toList();

        if (!acceptedAgreementIds.containsAll(requiredAgreementIds)) {
            return Result.error(PaymentErrorCodes.REQUIRED_AGREEMENTS_NOT_ACCEPTED);
        }

        return Result.success();
    }
}

