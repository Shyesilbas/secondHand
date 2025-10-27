package com.serhat.secondhand.ewallet.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class DepositRequest {
    private BigDecimal amount;
    private UUID bankId;
    private boolean agreementsAccepted;
    private List<UUID> acceptedAgreementIds;
}
