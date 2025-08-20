package com.serhat.secondhand.agreements.repository;

import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAgreementRepository extends JpaRepository<UserAgreement, UUID> {
    Optional<UserAgreement> findByUser_IdAndAgreement_AgreementId(Long userId, UUID agreementId);
    List<UserAgreement> findByUser_Id(Long userId);
    boolean existsByUser_IdAndAgreement_AgreementTypeAndIsAcceptedTheLastVersionTrue(Long userId, AgreementType type);
}
