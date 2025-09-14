package com.serhat.secondhand.ewallet.dto;

import java.math.BigDecimal;

public class EWalletDto {
    private Long userId;
    private BigDecimal balance;
    private BigDecimal limit;

    public EWalletDto() {}

    public EWalletDto(Long userId, BigDecimal balance, BigDecimal limit) {
        this.userId = userId;
        this.balance = balance;
        this.limit = limit;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public void setLimit(BigDecimal limit) {
        this.limit = limit;
    }
}
