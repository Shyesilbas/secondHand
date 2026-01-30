package com.serhat.secondhand.agreements.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.AgreementUpdateEvent;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.AgreementUpdateEventRepository;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.repository.NotificationRepository;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementUpdateWatcher {

    private final AgreementRequirementService agreementRequirementService;
    private final AgreementService agreementService;
    private final AgreementUpdateEventRepository agreementUpdateEventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 30_000)
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

            notifyAllUsersAboutAgreementUpdate(type, version);
        }
    }

    private void notifyAllUsersAboutAgreementUpdate(AgreementType type, String version) {
        List<Long> userIds = userRepository.findAllUserIds();
        if (userIds.isEmpty()) {
            return;
        }

        String agreementName = toTitle(type.name());
        String metadata;
        try {
            Map<String, String> payload = new LinkedHashMap<>();
            payload.put("agreementType", type.name());
            payload.put("version", version);
            metadata = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to build agreement update metadata", e);
            return;
        }

        for (Long userId : userIds) {
            boolean alreadyExists = notificationRepository.existsByUser_IdAndTypeAndMetadataAndIsReadFalse(
                    userId, NotificationType.AGREEMENT_UPDATED, metadata);
            if (alreadyExists) {
                continue;
            }
            notificationService.createAndSend(NotificationRequest.builder()
                    .userId(userId)
                    .type(NotificationType.AGREEMENT_UPDATED)
                    .title("Sözleşme Güncellendi")
                    .message("\"" + agreementName + "\" sözleşmesi güncellendi (v" + version + "). İncelemek ve onaylamak için tıklayın.")
                    .actionUrl("/agreements/all")
                    .metadata(metadata)
                    .build());
        }
        log.info("Agreement update notification queued for type={} version={} users={}", type, version, userIds.size());
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

