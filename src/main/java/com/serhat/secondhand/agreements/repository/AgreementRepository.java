package com.serhat.secondhand.agreements.repository;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, UUID> {
    Optional<Agreement> findByAgreementType(AgreementType agreementType);
    List<Agreement> findAllByAgreementTypeIn(Collection<AgreementType> agreementTypes);
}
