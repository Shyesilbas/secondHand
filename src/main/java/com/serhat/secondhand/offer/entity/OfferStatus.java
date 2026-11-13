package com.serhat.secondhand.offer.entity;

import java.util.Set;

public enum OfferStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    EXPIRED,
    COMPLETED;

    /** Statuses that move to EXPIRED once expiresAt passes (response deadline, then payment deadline). */
    public static final Set<OfferStatus> EXPIRABLE = Set.of(PENDING, ACCEPTED);
}
