package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.UserAgreementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementUpdateNotificationService {

    private final AgreementRequirementService agreementRequirementService;
    private final AgreementService agreementService;
    private final UserAgreementRepository userAgreementRepository;
    private final AgreementEmailNotificationService agreementEmailNotificationService;
    private final AgreementAcceptanceBackfillHelper agreementAcceptanceBackfillHelper;

    @Transactional
    public void notifyOutdatedRequiredAgreements(Long userId) {
        List<AgreementType> requiredTypes = agreementRequirementService.getAllRequiredAgreementTypes();
        for (AgreementType type : requiredTypes) {
            Agreement agreement = agreementService.getAgreementByType(type);
            UserAgreement userAgreement = userAgreementRepository.findByUser_IdAndAgreement_AgreementType(userId, type)
                    .orElse(null);

            String currentVersion = agreement.getVersion();
            if (userAgreement != null && userAgreement.getAcceptedVersion() == null
                    && agreementAcceptanceBackfillHelper.shouldBackfillAcceptedVersion(userAgreement)) {
                userAgreement.setAcceptedVersion(currentVersion);
                userAgreement.setAcceptedTheLastVersion(true);
                userAgreementRepository.save(userAgreement);
            }
            String acceptedVersion = userAgreement != null ? userAgreement.getAcceptedVersion() : null;
            boolean isLatest = currentVersion != null && currentVersion.equals(acceptedVersion);
            if (isLatest) {
                continue;
            }

            agreementEmailNotificationService.notifyUserOutdatedAgreement(userId, type, currentVersion);
        }
    }

}
