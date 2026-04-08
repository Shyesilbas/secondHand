package com.serhat.secondhand.core.seed;

import com.serhat.secondhand.agreements.repository.AgreementRepository;
import com.serhat.secondhand.agreements.repository.AgreementRequirementRepository;
import com.serhat.secondhand.core.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seed.startup-enabled", havingValue = "true", matchIfMissing = true)
public class SeedStartupRunner implements ApplicationRunner {

    private static final List<String> LISTING_SEED_KEYS = List.of(
            "vehicle",
            "electronics",
            "realestate",
            "clothing",
            "books",
            "sports"
    );

    private final SeedRunnerService seedRunnerService;
    private final AgreementRepository agreementRepository;
    private final AgreementRequirementRepository agreementRequirementRepository;

    @Override
    public void run(ApplicationArguments args) {
        for (String key : LISTING_SEED_KEYS) {
            runSeed(key);
        }

        boolean agreementsMissing = agreementRepository.count() == 0 || agreementRequirementRepository.count() == 0;
        if (agreementsMissing) {
            runSeed("agreements");
        } else {
            log.info("Skipping seed '{}' because agreement repositories are already populated.", "agreements");
        }
    }

    private void runSeed(String key) {
        Result<Void> result = seedRunnerService.run(key);
        if (result.isError()) {
            log.error("Startup seed failed for key '{}': {}", key, result.getMessage());
            return;
        }
        log.info("Startup seed completed for key '{}'.", key);
    }
}



