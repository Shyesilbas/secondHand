package com.serhat.secondhand.complaint;

/**
 * Sanction ladder steps, ordered from lightest to heaviest.
 */
public enum PenaltyAction {
    NONE,
    WARNING,
    LISTING_SUSPENDED,
    TEMP_BAN_7_DAYS,
    PERM_BAN;

    /** Steps the penalized user may appeal (proposal section 5.6); a permanent ban is final. */
    public boolean isAppealable() {
        return this == WARNING || this == LISTING_SUSPENDED || this == TEMP_BAN_7_DAYS;
    }
}
