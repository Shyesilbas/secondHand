package com.serhat.secondhand.ewallet.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class WithdrawRequest {
    private BigDecimal amount;
    private UUID bankId;
    private boolean agreementsAccepted;
    private java.util.List<java.util.UUID> acceptedAgreementIds;
}
