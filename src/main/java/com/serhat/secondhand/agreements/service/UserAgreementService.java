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

@Service
@Slf4j
@RequiredArgsConstructor
public class UserAgreementService {

    private final UserAgreementRepository userAgreementRepository;
    private final AgreementService agreementService;
    private final UserAgreementMapper userAgreementMapper;
    private final UserService userService;

    public UserAgreementDto acceptAgreement(User user, AcceptAgreementRequest request) {
        Agreement agreement = agreementService.getAgreementById(request.getAgreementId());

        UserAgreement userAgreement = userAgreementRepository
                .findByUser_IdAndAgreement_AgreementId(user.getId(), agreement.getAgreementId())
                .orElse(UserAgreement.builder()
                        .user(user)
                        .agreement(agreement)
                        .build());

        userAgreement.setAcceptedTheLastVersion(request.isAcceptedTheLastVersion());
        userAgreement.setAcceptedDate(LocalDate.now());

        return userAgreementMapper.toDto(userAgreementRepository.save(userAgreement));
    }

    public List<UserAgreementDto> getUserAgreements(User user) {
        return userAgreementMapper.toDtoList(userAgreementRepository.findByUser_Id(user.getId()));
    }

    public boolean hasUserAcceptedAgreement(User user, AgreementType agreementType) {
        return userAgreementRepository.existsByUser_IdAndAgreement_AgreementTypeAndIsAcceptedTheLastVersionTrue(
                user.getId(), agreementType);
    }

    public List<UserAgreementDto> getUserAcceptanceHistory(User user, java.util.UUID agreementId) {
        return userAgreementMapper.toDtoList(
            userAgreementRepository.findByUser_IdAndAgreement_AgreementIdOrderByAcceptedDateDesc(
                user.getId(), agreementId)
        );
    }


    @Transactional
    public void acceptRequiredAgreementsForAllUsers() {
        log.info("Starting to accept required agreements for all existing users");
        
        List<User> allUsers = userService.getAllUsers();
        int processedCount = 0;
        int successCount = 0;
        
        for (User user : allUsers) {
            try {
                processedCount++;
                log.info("Processing user {}/{}: {}", processedCount, allUsers.size(), user.getEmail());
                
            } catch (Exception e) {
                log.error("Failed to process user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        
        log.info("Completed processing all users. Processed: {}, Success: {}", processedCount, successCount);
    }

}
