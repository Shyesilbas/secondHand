package com.serhat.secondhand.agreements.service;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.AgreementRequirement;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.repository.AgreementRepository;
import com.serhat.secondhand.agreements.repository.AgreementRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgreementRequirementService {

    private final AgreementRequirementRepository agreementRequirementRepository;
    private final AgreementRepository agreementRepository;

    public List<Agreement> getRequiredAgreements(String groupCode) {
        String normalizedGroupCode = normalizeGroupCode(groupCode);
        List<AgreementRequirement> requirements = agreementRequirementRepository
                .findAllByGroupCodeIgnoreCaseAndActiveTrueOrderByDisplayOrderAsc(normalizedGroupCode);
        List<AgreementType> types = requirements.stream()
                .map(AgreementRequirement::getAgreementType)
                .distinct()
                .toList();
        if (types.isEmpty()) {
            return List.of();
        }
        List<Agreement> agreements = agreementRepository.findAllByAgreementTypeIn(types);
        Map<AgreementType, Agreement> byType = new HashMap<>();
        for (Agreement a : agreements) {
            if (a.getAgreementType() != null && !byType.containsKey(a.getAgreementType())) {
                byType.put(a.getAgreementType(), a);
            }
        }
        for (AgreementRequirement req : requirements) {
            if (!byType.containsKey(req.getAgreementType())) {
                throw new IllegalStateException("Missing agreement for required type: " + req.getAgreementType());
            }
        }
        return requirements.stream()
                .map(AgreementRequirement::getAgreementType)
                .map(byType::get)
                .toList();
    }

    public List<AgreementType> getAllRequiredAgreementTypes() {
        return agreementRequirementRepository.findAllByActiveTrue()
                .stream()
                .map(AgreementRequirement::getAgreementType)
                .distinct()
                .toList();
    }

    private String normalizeGroupCode(String groupCode) {
        if (groupCode == null) return null;
        return groupCode.trim().toUpperCase(Locale.ROOT);
    }
}

