package com.serhat.secondhand.listing.domain.entity.enums.common;

/**
 * How a catalog type (vehicle type, electronic type) treats one listing spec field;
 * set per type in that vertical's {@code data/<vertical>/types.json}.
 */
public enum SpecFieldRule {
    REQUIRED,
    OPTIONAL,
    /** Not asked for this type; the value is cleared on save. */
    HIDDEN
}
