package com.serhat.secondhand.agreements.service;

import com.serhat.secondhand.agreements.repository.AgreementRepository;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.entity.Agreement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AgreementService {

    @Value("${app.agreements.termsOfService.content}")
    private String termsOfServiceContent;

    @Value("${app.agreements.kvkk.content}")
    private String kvkkContent;

    @Value("${app.agreements.privacyPolicy.content}")
    private String privacyPolicyContent;

    private final AgreementRepository agreementRepository;

    public List<Agreement> createAgreements() {
        log.info("Creating agreements for all types if they don't exist");
        
        for (AgreementType type : AgreementType.values()) {
            createAgreementIfNotExists(type);
        }
        
        return agreementRepository.findAll();
    }

    public Agreement createAgreementIfNotExists(AgreementType agreementType) {
        Optional<Agreement> existingAgreement = agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType() == agreementType)
                .findFirst();

        if (existingAgreement.isPresent()) {
            log.info("Agreement for type {} already exists, skipping creation", agreementType);
            return existingAgreement.get();
        }

        String content = getContentForType(agreementType);
        String version = getVersionForType(agreementType);

        Agreement agreement = Agreement.builder()
                .agreementType(agreementType)
                .content(content)
                .version(version)
                .createdDate(LocalDate.now())
                .updatedDate(LocalDate.now())
                .build();

        Agreement savedAgreement = agreementRepository.save(agreement);
        log.info("Created agreement for type: {}", agreementType);
        return savedAgreement;
    }

    private String getContentForType(AgreementType agreementType) {
        if (agreementType instanceof AgreementType) {
            switch (agreementType) {
                case TERMS_OF_SERVICE:
                    return termsOfServiceContent;
                case PRIVACY_POLICY:
                    return privacyPolicyContent;
                case KVKK:
                    return kvkkContent;
                default:
                    throw new IllegalArgumentException("Unknown agreement type: " + agreementType);
            }
        }
        throw new IllegalArgumentException("Invalid agreement type: " + agreementType);
    }

    private String getVersionForType(AgreementType agreementType) {
        Optional<Agreement> existingAgreement = agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType() == agreementType)
                .findFirst();

        if (existingAgreement.isPresent()) {
            return incrementVersion(existingAgreement.get().getVersion());
        }

        return "1.0.0";
    }


    private String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.trim().isEmpty()) {
            return "1.0.0";
        }

        try {
            String[] parts = currentVersion.split("\\.");
            if (parts.length != 3) {
                log.warn("Invalid version format: {}, using default", currentVersion);
                return "1.0.0";
            }

            int major = Integer.parseInt(parts[0]);
            int minor = Integer.parseInt(parts[1]);
            int patch = Integer.parseInt(parts[2]);

            patch++;

            return major + "." + minor + "." + patch;
        } catch (NumberFormatException e) {
            log.warn("Invalid version format: {}, using default", currentVersion);
            return "1.0.0";
        }
    }


    private boolean isValidVersion(String version) {
        if (version == null || version.trim().isEmpty()) {
            return false;
        }

        String[] parts = version.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            Integer.parseInt(parts[0]);
            Integer.parseInt(parts[1]); // minor
            Integer.parseInt(parts[2]); // patch
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public Agreement getAgreementByType(AgreementType agreementType) {
        return agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType() == agreementType)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Agreement not found for type: " + agreementType));
    }

    public Agreement getAgreementById(UUID agreementId) {
        return agreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Agreement not found with ID: " + agreementId));
    }

    public List<Agreement> getAllAgreements() {
        return agreementRepository.findAll();
    }

    public List<Agreement> getRequiredAgreements() {
        return agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType().isRequiredForRegistration())
                .toList();
    }

    public Agreement updateAgreement(UUID agreementId, String content) {
        Agreement agreement = getAgreementById(agreementId);

        String newVersion = agreement.getVersion();
        if (!agreement.getContent().equals(content)) {
            newVersion = incrementVersion(agreement.getVersion());
            log.info("Content changed for agreement {}, incrementing version from {} to {}",
                    agreementId, agreement.getVersion(), newVersion);
        }

        agreement.setVersion(newVersion);
        agreement.setContent(content);
        agreement.setUpdatedDate(LocalDate.now());

        Agreement updatedAgreement = agreementRepository.save(agreement);
        log.info("Updated agreement with ID: {}, new version: {}", agreementId, newVersion);
        return updatedAgreement;
    }


    public Agreement updateAgreementWithVersion(UUID agreementId, String version, String content) {
        Agreement agreement = getAgreementById(agreementId);

        if (!isValidVersion(version)) {
            throw new IllegalArgumentException("Invalid version format: " + version + ". Expected format: x.y.z");
        }

        agreement.setVersion(version);
        agreement.setContent(content);
        agreement.setUpdatedDate(LocalDate.now());

        Agreement updatedAgreement = agreementRepository.save(agreement);
        log.info("Updated agreement with ID: {}, manual version: {}", agreementId, version);
        return updatedAgreement;
    }

    public Agreement updateAgreementByType(AgreementType agreementType, String content) {
        Agreement agreement = getAgreementByType(agreementType);
        return updateAgreement(agreement.getAgreementId(), content);
    }

    public Agreement updateAgreementByTypeWithVersion(AgreementType agreementType, String version, String content) {
        Agreement agreement = getAgreementByType(agreementType);
        return updateAgreementWithVersion(agreement.getAgreementId(), version, content);
    }
}
