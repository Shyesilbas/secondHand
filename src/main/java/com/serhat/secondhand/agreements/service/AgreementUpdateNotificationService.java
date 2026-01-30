package com.serhat.secondhand.agreements.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.UserAgreementRepository;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.repository.NotificationRepository;
import com.serhat.secondhand.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementUpdateNotificationService {

    private final AgreementRequirementService agreementRequirementService;
    private final AgreementService agreementService;
    private final UserAgreementRepository userAgreementRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void notifyOutdatedRequiredAgreements(Long userId) {
        List<AgreementType> requiredTypes = agreementRequirementService.getAllRequiredAgreementTypes();
        for (AgreementType type : requiredTypes) {
            Agreement agreement = agreementService.getAgreementByType(type);
            UserAgreement userAgreement = userAgreementRepository.findByUser_IdAndAgreement_AgreementType(userId, type)
                    .orElse(null);

            String currentVersion = agreement.getVersion();
            if (userAgreement != null && userAgreement.getAcceptedVersion() == null && shouldBackfillAcceptedVersion(userAgreement)) {
                userAgreement.setAcceptedVersion(currentVersion);
                userAgreement.setAcceptedTheLastVersion(true);
                userAgreementRepository.save(userAgreement);
            }
            String acceptedVersion = userAgreement != null ? userAgreement.getAcceptedVersion() : null;
            boolean isLatest = currentVersion != null && currentVersion.equals(acceptedVersion);
            if (isLatest) {
                continue;
            }

            String agreementName = toTitle(type.name());
            String versionText = currentVersion == null ? "" : (" (v" + currentVersion + ")");
            String metadata = null;
            try {
                Map<String, String> payload = new LinkedHashMap<>();
                payload.put("agreementType", type.name());
                payload.put("version", currentVersion == null ? "" : currentVersion);
                metadata = objectMapper.writeValueAsString(payload);
            } catch (JsonProcessingException e) {
                log.error("Failed to build agreement notification metadata", e);
                continue;
            }

            boolean alreadyExists = notificationRepository.existsByUser_IdAndTypeAndMetadataAndIsReadFalse(
                    userId, NotificationType.AGREEMENT_UPDATED, metadata);
            if (alreadyExists) {
                continue;
            }

            notificationService.createAndSend(NotificationRequest.builder()
                    .userId(userId)
                    .type(NotificationType.AGREEMENT_UPDATED)
                    .title("Sözleşme Güncellendi")
                    .message("\"" + agreementName + "\" sözleşmesi güncellendi" + versionText + ". İncelemek ve onaylamak için tıklayın.")
                    .actionUrl("/agreements/all")
                    .metadata(metadata)
                    .build());
        }
    }

    private boolean shouldBackfillAcceptedVersion(UserAgreement userAgreement) {
        if (userAgreement == null) return false;
        if (!userAgreement.isAcceptedTheLastVersion()) return false;
        if (userAgreement.getAgreement() == null) return false;
        if (userAgreement.getAgreement().getVersion() == null) return false;
        if (userAgreement.getAgreement().getUpdatedDate() == null) return false;
        if (userAgreement.getAcceptedDate() == null) return false;
        return !userAgreement.getAcceptedDate().isBefore(userAgreement.getAgreement().getUpdatedDate());
    }

    private String toTitle(String value) {
        String lower = value.replace('_', ' ').toLowerCase(Locale.ROOT);
        String[] parts = lower.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p.isBlank()) continue;
            sb.append(Character.toUpperCase(p.charAt(0)));
            if (p.length() > 1) sb.append(p.substring(1));
            sb.append(' ');
        }
        return sb.toString().trim();
    }
}

