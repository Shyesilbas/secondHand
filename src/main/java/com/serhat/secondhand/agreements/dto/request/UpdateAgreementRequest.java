package com.serhat.secondhand.agreements.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAgreementRequest {
    @NotBlank(message = "Version is required")
    private String version;
    
    @NotBlank(message = "Content is required")
    private String content;
}
