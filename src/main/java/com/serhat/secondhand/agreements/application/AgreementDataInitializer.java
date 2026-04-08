package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AgreementDataInitializer implements SeedTask {

    private final AgreementService agreementService;
    private final AgreementRequirementService agreementRequirementService;

    @Override
    public String key() {
        return "agreements";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        agreementService.createAgreements();
        agreementRequirementService.initializeDefaultRequirements();
        return Result.success();
    }
}

