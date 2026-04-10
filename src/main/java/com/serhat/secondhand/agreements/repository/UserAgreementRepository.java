package com.serhat.secondhand.agreements.repository;

import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAgreementRepository extends JpaRepository<UserAgreement, UUID> {
    Optional<UserAgreement> findByUser_IdAndAgreement_AgreementId(Long userId, UUID agreementId);
    Optional<UserAgreement> findByUser_IdAndAgreement_AgreementType(Long userId, AgreementType agreementType);
    List<UserAgreement> findByUser_Id(Long userId);
    @EntityGraph(attributePaths = "agreement")
    List<UserAgreement> findByUser_IdOrderByAcceptedDateDesc(Long userId);
    @EntityGraph(attributePaths = "agreement")
    List<UserAgreement> findByUser_IdInAndAgreement_AgreementTypeIn(Collection<Long> userIds, Collection<AgreementType> agreementTypes);
    boolean existsByUser_IdAndAgreement_AgreementTypeAndIsAcceptedTheLastVersionTrue(Long userId, AgreementType type);
    List<UserAgreement> findByUser_IdAndAgreement_AgreementIdOrderByAcceptedDateDesc(Long userId, UUID agreementId);
}
