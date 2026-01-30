package com.serhat.secondhand.agreements.service;

import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.mapper.UserAgreementMapper;
import com.serhat.secondhand.agreements.repository.UserAgreementRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserAgreementService {

    private final UserAgreementRepository userAgreementRepository;
    private final AgreementService agreementService;
    private final AgreementRequirementService agreementRequirementService;
    private final UserAgreementMapper userAgreementMapper;
    private final UserService userService;

    public UserAgreementDto acceptAgreement(Long userId, AcceptAgreementRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new IllegalArgumentException(userResult.getMessage());
        }
        User user = userResult.getData();
        Agreement agreement = agreementService.getAgreementById(request.getAgreementId());

        UserAgreement userAgreement = userAgreementRepository
                .findByUser_IdAndAgreement_AgreementId(user.getId(), agreement.getAgreementId())
                .orElse(UserAgreement.builder()
                        .user(user)
                        .agreement(agreement)
                        .build());

        userAgreement.setAcceptedVersion(agreement.getVersion());
        userAgreement.setAcceptedTheLastVersion(true);
        userAgreement.setAcceptedDate(LocalDate.now());

        return userAgreementMapper.toDto(userAgreementRepository.save(userAgreement));
    }

    public List<UserAgreementDto> getUserAgreements(Long userId) {
        List<UserAgreement> agreements = userAgreementRepository.findByUser_Id(userId);
        boolean needsSave = false;
        for (UserAgreement ua : agreements) {
            String current = ua.getAgreement() != null ? ua.getAgreement().getVersion() : null;
            if (ua.getAcceptedVersion() == null) {
                if (shouldBackfillAcceptedVersion(ua)) {
                    ua.setAcceptedVersion(current);
                    ua.setAcceptedTheLastVersion(true);
                    needsSave = true;
                    continue;
                }
            }
            boolean isLatest = current != null && current.equals(ua.getAcceptedVersion());
            if (ua.isAcceptedTheLastVersion() != isLatest) {
                ua.setAcceptedTheLastVersion(isLatest);
                needsSave = true;
            }
        }
        if (needsSave) {
            userAgreementRepository.saveAll(agreements);
        }
        return userAgreementMapper.toDtoList(agreements);
    }

    public boolean hasUserAcceptedAgreement(Long userId, AgreementType agreementType) {
        Agreement agreement = agreementService.getAgreementByType(agreementType);
        var userAgreement = userAgreementRepository.findByUser_IdAndAgreement_AgreementType(userId, agreementType)
                .orElse(null);
        if (userAgreement == null) {
            return false;
        }
        if (userAgreement.getAcceptedVersion() == null && shouldBackfillAcceptedVersion(userAgreement)) {
            userAgreement.setAcceptedVersion(agreement.getVersion());
            userAgreement.setAcceptedTheLastVersion(true);
            userAgreementRepository.save(userAgreement);
            return true;
        }
        boolean isLatest = agreement.getVersion() != null && agreement.getVersion().equals(userAgreement.getAcceptedVersion());
        if (userAgreement.isAcceptedTheLastVersion() != isLatest) {
            userAgreement.setAcceptedTheLastVersion(isLatest);
            userAgreementRepository.save(userAgreement);
        }
        return isLatest;
    }

    public List<UserAgreementDto> getUserAcceptanceHistory(Long userId, UUID agreementId) {
        return userAgreementMapper.toDtoList(
            userAgreementRepository.findByUser_IdAndAgreement_AgreementIdOrderByAcceptedDateDesc(
                userId, agreementId)
        );
    }


    @Transactional
    public void acceptRequiredAgreementsForAllUsers() {
        log.info("Starting to accept required agreements for all existing users");
        
        List<User> allUsers = userService.getAllUsers();
        int processedCount = 0;
        int updatedCount = 0;

        List<AgreementType> requiredTypes = agreementRequirementService.getAllRequiredAgreementTypes();
        
        for (User user : allUsers) {
            try {
                processedCount++;
                for (AgreementType type : requiredTypes) {
                    Agreement agreement = agreementService.getAgreementByType(type);
                    UserAgreement userAgreement = userAgreementRepository
                            .findByUser_IdAndAgreement_AgreementId(user.getId(), agreement.getAgreementId())
                            .orElse(UserAgreement.builder()
                                    .user(user)
                                    .agreement(agreement)
                                    .build());
                    userAgreement.setAcceptedTheLastVersion(true);
                    userAgreement.setAcceptedVersion(agreement.getVersion());
                    userAgreement.setAcceptedDate(LocalDate.now());
                    userAgreementRepository.save(userAgreement);
                    updatedCount++;
                }
            } catch (Exception e) {
                log.error("Failed to process user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        
        log.info("Completed processing all users. Processed users: {}, Updated agreements: {}", processedCount, updatedCount);
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

}
