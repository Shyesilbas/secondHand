package com.serhat.secondhand.agreements.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptAgreementRequest {
    @NotNull(message = "Agreement ID is required")
    private UUID agreementId;
    
    private boolean isAcceptedTheLastVersion = true;
}
