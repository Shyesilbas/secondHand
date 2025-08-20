package com.serhat.secondhand.agreements.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
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
public class AgreementDto {
    private UUID agreementId;
    private AgreementType agreementType;
    private String version;
    private String content;
    
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate createdDate;
    
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate updatedDate;
}
