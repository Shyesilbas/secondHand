package com.serhat.secondhand.listing.domain.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateBatchPriceRequest(
        @NotEmpty List<@Valid UUID> listingIds,
        @NotNull @DecimalMin("0") BigDecimal price) {}
