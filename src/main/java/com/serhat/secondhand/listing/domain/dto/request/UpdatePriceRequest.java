package com.serhat.secondhand.listing.domain.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdatePriceRequest(@NotNull @DecimalMin("0") BigDecimal price) {}
