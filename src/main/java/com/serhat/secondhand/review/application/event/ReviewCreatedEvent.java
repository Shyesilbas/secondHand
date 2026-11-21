package com.serhat.secondhand.review.application.event;

import java.util.UUID;

/** Published inside the review transaction; listeners that cache review-derived data refresh on commit. */
public record ReviewCreatedEvent(Integer reviewId, Long reviewedUserId, UUID listingId) {
}
