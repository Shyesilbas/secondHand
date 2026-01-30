package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record SportsCreateRequest(
        @NotNull @Valid BaseListingCreateRequest base,
        @NotNull @Min(1) Integer quantity,
        @NotNull UUID disciplineId,
        @NotNull UUID equipmentTypeId,
        @NotNull UUID conditionId
) {}


