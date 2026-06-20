package com.serhat.secondhand.auth.domain.validator;

import com.serhat.secondhand.agreements.application.AgreementRequirementService;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RegistrationValidator {

    private final IUserService userService;
    private final AgreementRequirementService agreementRequirementService;

    public Result<Void> validate(RegisterRequest request) {
        Result<Void> validationResult = userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber());
        if (validationResult.isError()) {
            return validationResult;
        }

        if (Boolean.FALSE.equals(request.getAgreementsAccepted())) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        var requiredAgreements = agreementRequirementService.getRequiredAgreements("REGISTER");
        Set<UUID> requiredIds = requiredAgreements.stream().map(Agreement::getAgreementId).collect(Collectors.toSet());
        Set<UUID> acceptedIds = new HashSet<>(request.getAcceptedAgreementIds() != null ? request.getAcceptedAgreementIds() : Set.of());
        
        if (!acceptedIds.containsAll(requiredIds)) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        return Result.success();
    }
}
