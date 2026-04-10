package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.mapper.UserAgreementMapper;
import com.serhat.secondhand.agreements.repository.UserAgreementRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserAgreementService {

    private final UserAgreementRepository userAgreementRepository;
    private final AgreementService agreementService;
    private final AgreementRequirementService agreementRequirementService;
    private final UserAgreementMapper userAgreementMapper;
    private final IUserService userService;
    private final AgreementAcceptanceBackfillHelper agreementAcceptanceBackfillHelper;

    public UserAgreementDto acceptAgreement(Long userId, AcceptAgreementRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new BusinessException(userResult.getMessage(), HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
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
        userAgreement.setAcceptedTheLastVersion(request.isAcceptedTheLastVersion());
        userAgreement.setAcceptedDate(LocalDate.now());

        return userAgreementMapper.toDto(userAgreementRepository.save(userAgreement));
    }

    public List<UserAgreementDto> getUserAgreements(Long userId) {
        List<UserAgreement> agreements = userAgreementRepository.findByUser_IdOrderByAcceptedDateDesc(userId);
        boolean needsSave = false;
        for (UserAgreement ua : agreements) {
            String current = ua.getAgreement() != null ? ua.getAgreement().getVersion() : null;
            if (ua.getAcceptedVersion() == null) {
                if (agreementAcceptanceBackfillHelper.shouldBackfillAcceptedVersion(ua)) {
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
        if (userAgreement.getAcceptedVersion() == null && agreementAcceptanceBackfillHelper.shouldBackfillAcceptedVersion(userAgreement)) {
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
        Map<AgreementType, Agreement> agreementsByType = agreementService.getAgreementsByTypes(requiredTypes).stream()
                .collect(Collectors.toMap(Agreement::getAgreementType, agreement -> agreement));
        Map<Long, User> usersById = allUsers.stream().collect(Collectors.toMap(User::getId, user -> user));
        List<Long> userIds = allUsers.stream().map(User::getId).toList();
        List<UserAgreement> existingAgreements = userAgreementRepository
                .findByUser_IdInAndAgreement_AgreementTypeIn(userIds, requiredTypes);
        Map<String, UserAgreement> existingByUserAndType = mapByUserAndType(existingAgreements);
        List<UserAgreement> batchToSave = new java.util.ArrayList<>();
        LocalDate now = LocalDate.now();

        for (User user : allUsers) {
            try {
                processedCount++;
                for (AgreementType type : requiredTypes) {
                    Agreement agreement = agreementsByType.get(type);
                    if (agreement == null) {
                        continue;
                    }
                    String key = buildUserTypeKey(user.getId(), type);
                    UserAgreement userAgreement = existingByUserAndType.get(key);
                    if (userAgreement == null) {
                        userAgreement = UserAgreement.builder()
                                .user(usersById.get(user.getId()))
                                .agreement(agreement)
                                .build();
                        existingByUserAndType.put(key, userAgreement);
                    }
                    userAgreement.setAcceptedTheLastVersion(true);
                    userAgreement.setAcceptedVersion(agreement.getVersion());
                    userAgreement.setAcceptedDate(now);
                    batchToSave.add(userAgreement);
                    updatedCount++;
                }
            } catch (Exception e) {
                log.error("Failed to process user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        if (!batchToSave.isEmpty()) {
            userAgreementRepository.saveAll(batchToSave);
        }
        log.info("Completed processing all users. Processed users: {}, Updated agreements: {}", processedCount, updatedCount);
    }

    private Map<String, UserAgreement> mapByUserAndType(Collection<UserAgreement> agreements) {
        Map<String, UserAgreement> result = new HashMap<>();
        for (UserAgreement agreement : agreements) {
            if (agreement.getUser() == null || agreement.getAgreement() == null || agreement.getAgreement().getAgreementType() == null) {
                continue;
            }
            result.put(buildUserTypeKey(agreement.getUser().getId(), agreement.getAgreement().getAgreementType()), agreement);
        }
        return result;
    }

    private String buildUserTypeKey(Long userId, AgreementType type) {
        return userId + ":" + type.name();
    }

}
