package com.serhat.secondhand.agreements.dto.request;

import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAgreementRequest {
    @NotNull(message = "Agreement type is required")
    private AgreementType agreementType;
    
    @NotBlank(message = "Version is required")
    private String version;
    
    @NotBlank(message = "Content is required")
    private String content;
}
