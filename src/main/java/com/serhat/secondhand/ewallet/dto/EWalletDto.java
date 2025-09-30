package com.serhat.secondhand.ewallet.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class EWalletDto {
    private Long userId;
    private BigDecimal balance;
    private BigDecimal limit;
    private BigDecimal spendingWarningLimit;

    public EWalletDto() {}

    public EWalletDto(Long userId, BigDecimal balance, BigDecimal limit, BigDecimal spendingWarningLimit) {
        this.userId = userId;
        this.balance = balance;
        this.limit = limit;
        this.spendingWarningLimit = spendingWarningLimit;
    }

}
