package com.serhat.secondhand.listing.domain.dto.request;

/** Status changes a seller can apply to several of their own listings at once. */
public enum ListingBatchStatusAction {
    /** ACTIVE to INACTIVE. */
    DEACTIVATE,
    /** INACTIVE to ACTIVE. */
    REACTIVATE,
    /** ACTIVE to SOLD. */
    MARK_SOLD
}
