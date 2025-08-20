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
        if (agreementType instanceof AgreementType) {
            switch (agreementType) {
                case TERMS_OF_SERVICE:
                    return "1.0.0";
                case PRIVACY_POLICY:
                    return "1.0.0";
                case KVKK:
                    return "1.0.0";
                default:
                    return "1.0.0";
            }
        }
        return "1.0.0";
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

    public Agreement updateAgreement(UUID agreementId, String version, String content) {
        Agreement agreement = getAgreementById(agreementId);
        
        agreement.setVersion(version);
        agreement.setContent(content);
        agreement.setUpdatedDate(LocalDate.now());
        
        Agreement updatedAgreement = agreementRepository.save(agreement);
        log.info("Updated agreement with ID: {}, new version: {}", agreementId, version);
        return updatedAgreement;
    }

    public Agreement updateAgreementByType(AgreementType agreementType, String version, String content) {
        Agreement agreement = getAgreementByType(agreementType);
        return updateAgreement(agreement.getAgreementId(), version, content);
    }
}
