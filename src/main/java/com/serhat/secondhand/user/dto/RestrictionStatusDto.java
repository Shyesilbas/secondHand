package com.serhat.secondhand.user.dto;

import java.time.LocalDateTime;

/**
 * The current user's moderation restrictions, for the frontend banner. {@code bannedUntil} is null
 * for a permanent ban and when the user is not restricted.
 */
public record RestrictionStatusDto(
        boolean restricted,
        boolean permanent,
        LocalDateTime bannedUntil,
        boolean canSendMessages,
        boolean canCreateListings,
        boolean canMakeOffers,
        boolean canCheckout
) {
}
