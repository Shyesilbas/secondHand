package com.serhat.secondhand.listing.domain.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record UpdateBatchQuantityRequest(
        @NotEmpty List<@Valid UUID> listingIds,
        @NotNull @Min(1) Integer quantity) {}
