package com.serhat.secondhand.ewallet.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class UpdateLimitRequest {
    @NotNull @Positive
    private BigDecimal newLimit;

    public UpdateLimitRequest() {}

    public UpdateLimitRequest(BigDecimal newLimit) {
        this.newLimit = newLimit;
    }

    public BigDecimal getNewLimit() {
        return newLimit;
    }

    public void setNewLimit(BigDecimal newLimit) {
        this.newLimit = newLimit;
    }
}
