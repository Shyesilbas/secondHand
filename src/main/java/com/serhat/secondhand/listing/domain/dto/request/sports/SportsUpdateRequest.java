package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;
import java.util.Optional;
import java.util.UUID;

public record SportsUpdateRequest(
        BaseListingUpdateRequest base,
        Optional<Integer> quantity,
        Optional<UUID> disciplineId,
        Optional<UUID> equipmentTypeId,
        Optional<UUID> conditionId
) {}


