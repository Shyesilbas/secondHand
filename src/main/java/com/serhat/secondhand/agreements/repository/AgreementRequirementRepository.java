package com.serhat.secondhand.agreements.repository;

import com.serhat.secondhand.agreements.entity.AgreementRequirement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementRequirementRepository extends JpaRepository<AgreementRequirement, UUID> {
    List<AgreementRequirement> findAllByGroupCodeIgnoreCaseAndActiveTrueOrderByDisplayOrderAsc(String groupCode);
    List<AgreementRequirement> findAllByActiveTrue();
    Optional<AgreementRequirement> findByGroupCodeIgnoreCaseAndAgreementType(String groupCode, AgreementType agreementType);
}

