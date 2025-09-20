package com.serhat.secondhand.agreements.service;

import com.serhat.secondhand.agreements.repository.AgreementRepository;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
import com.serhat.secondhand.agreements.util.AgreementErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
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
    private final AgreementVersionHelper agreementVersionHelper;

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
            return switch (agreementType) {
                case TERMS_OF_SERVICE -> termsOfServiceContent;
                case PRIVACY_POLICY -> privacyPolicyContent;
                case KVKK -> kvkkContent;
                default -> throw new IllegalArgumentException("Unknown agreement type: " + agreementType);
            };
        }
        throw new IllegalArgumentException("Invalid agreement type: " + agreementType);
    }

    private String getVersionForType(AgreementType agreementType) {
        Optional<Agreement> existingAgreement = agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType() == agreementType)
                .findFirst();
        if (existingAgreement.isPresent()) {
            return agreementVersionHelper.incrementVersion(existingAgreement.get().getVersion());
        }
        return "1.0.0";
    }

    public Agreement getAgreementByType(AgreementType agreementType) {
        return agreementRepository.findAll().stream()
                .filter(agreement -> agreement.getAgreementType() == agreementType)
                .findFirst()
                .orElseThrow(() -> new RuntimeException(AgreementErrorCodes.AGREEMENT_NOT_FOUND.getMessage()));
    }

    public Agreement getAgreementById(UUID agreementId) {
        return agreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException(AgreementErrorCodes.AGREEMENT_NOT_FOUND.getMessage()));
    }

    public List<Agreement> getAllAgreements() {
        return agreementRepository.findAll();
    }

    public List<Agreement> getRequiredAgreements(AgreementGroup group) {
        AgreementType[] requiredTypes = group.getRequiredTypes();
        return agreementRepository.findAll().stream()
                .filter(agreement -> Arrays.asList(requiredTypes).contains(agreement.getAgreementType()))
                .toList();
    }

    public Agreement updateAgreement(UUID agreementId, String content) {
        Agreement agreement = getAgreementById(agreementId);
        String newVersion = agreement.getVersion();
        newVersion = agreementVersionHelper.handleContentChange(agreement.getContent(), content, agreement.getVersion());
        agreement.setVersion(newVersion);
        agreement.setContent(content);
        agreement.setUpdatedDate(LocalDate.now());
        Agreement updatedAgreement = agreementRepository.save(agreement);
        log.info("Updated agreement with ID: {}, new version: {}", agreementId, newVersion);
        return updatedAgreement;
    }


    public Agreement updateAgreementWithVersion(UUID agreementId, String version, String content) {
        Agreement agreement = getAgreementById(agreementId);
        if (!agreementVersionHelper.isValidVersion(version)) {
            throw new IllegalArgumentException(AgreementErrorCodes.INVALID_VERSION.getMessage());
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
