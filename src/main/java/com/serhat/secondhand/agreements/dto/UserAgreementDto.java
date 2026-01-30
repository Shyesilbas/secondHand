package com.serhat.secondhand.agreements.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAgreementDto {
    private UUID userAgreementId;
    private Long userId;
    private UUID agreementId;
    private String agreementType;
    private String agreementVersion;
    private String acceptedVersion;
    private boolean acceptedTheLastVersion;
    
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate acceptedDate;
}
