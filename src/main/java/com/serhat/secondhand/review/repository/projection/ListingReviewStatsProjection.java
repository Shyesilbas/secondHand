package com.serhat.secondhand.review.repository.projection;

import java.util.UUID;

public interface ListingReviewStatsProjection extends ReviewStatsProjection {
    UUID getListingId();
}
