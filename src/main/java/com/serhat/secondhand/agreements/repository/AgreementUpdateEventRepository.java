package com.serhat.secondhand.agreements.repository;

import com.serhat.secondhand.agreements.entity.AgreementUpdateEvent;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementUpdateEventRepository extends JpaRepository<AgreementUpdateEvent, UUID> {
    Optional<AgreementUpdateEvent> findByAgreementTypeAndVersion(AgreementType agreementType, String version);
    boolean existsByAgreementTypeAndVersion(AgreementType agreementType, String version);
}

