package com.serhat.secondhand.ewallet.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class WithdrawRequest {
    private BigDecimal amount;
    private boolean agreementsAccepted;
    private java.util.List<java.util.UUID> acceptedAgreementIds;
}
