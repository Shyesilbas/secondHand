package com.serhat.secondhand.agreements.service;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.AgreementUpdateEvent;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.AgreementUpdateEventRepository;
import com.serhat.secondhand.notification.service.INotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementUpdateWatcher {

    private final AgreementRequirementService agreementRequirementService;
    private final AgreementService agreementService;
    private final AgreementUpdateEventRepository agreementUpdateEventRepository;
    private final INotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    @Transactional
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

            agreementUpdateEventRepository.save(AgreementUpdateEvent.builder()
                    .agreementType(type)
                    .version(version)
                    .build());

            notifyAgreementUpdate(type, version);
        }
    }

    private void notifyAgreementUpdate(AgreementType type, String version) {
        var request = notificationTemplateCatalog.agreementUpdatedBroadcast(type.name(), version);
        notificationService.createBroadcast(request);
        log.info("Agreement update broadcast created for type={} version={}", type, version);
    }
}

