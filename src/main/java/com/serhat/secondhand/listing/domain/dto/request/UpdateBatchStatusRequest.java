package com.serhat.secondhand.listing.domain.dto.request;

import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record UpdateBatchStatusRequest(
        @NotEmpty @Size(max = ListingBusinessConstants.MAX_BATCH_STATUS_SIZE) List<@NotNull UUID> listingIds,
        @NotNull ListingBatchStatusAction action) {}
