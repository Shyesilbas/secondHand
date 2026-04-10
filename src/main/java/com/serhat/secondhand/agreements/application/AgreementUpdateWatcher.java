package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.AgreementUpdateEvent;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.AgreementUpdateEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementUpdateWatcher {
    private static final long CHECK_INTERVAL_MS = 30L * 60L * 1000L;

    private final AgreementRequirementService agreementRequirementService;
    private final AgreementService agreementService;
    private final AgreementUpdateEventRepository agreementUpdateEventRepository;
    private final AgreementEmailNotificationService agreementEmailNotificationService;

    @Scheduled(fixedDelay = CHECK_INTERVAL_MS)
    public void checkAndNotifyAgreementUpdates() {
        List<AgreementType> requiredTypes = agreementRequirementService.getAllRequiredAgreementTypes();
        if (requiredTypes.isEmpty()) {
            return;
        }

        for (AgreementType type : requiredTypes) {
            Agreement agreement = agreementService.getAgreementByType(type);
            String version = agreement.getVersion();
            if (version == null || version.isBlank()) {
                continue;
            }
            if (agreementUpdateEventRepository.existsByAgreementTypeAndVersion(type, version)) {
                continue;
            }

            try {
                agreementUpdateEventRepository.save(AgreementUpdateEvent.builder()
                        .agreementType(type)
                        .version(version)
                        .build());
            } catch (DataIntegrityViolationException ex) {
                log.debug("Agreement update event already created concurrently for type={} version={}", type, version);
                continue;
            }

            // In-app bildirim yok; tüm kullanıcılara gelen kutusu e-postası
            agreementEmailNotificationService.notifyAllUsersAgreementPublished(type, version);
            log.info("Agreement update emails triggered for type={} version={}", type, version);
        }
    }
}
