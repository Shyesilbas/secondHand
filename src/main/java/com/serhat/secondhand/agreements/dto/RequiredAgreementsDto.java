package com.serhat.secondhand.agreements.dto;

import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequiredAgreementsDto {
    private List<AgreementDto> agreements;
    private List<AgreementType> requiredTypes;
    private boolean allAccepted;
}
