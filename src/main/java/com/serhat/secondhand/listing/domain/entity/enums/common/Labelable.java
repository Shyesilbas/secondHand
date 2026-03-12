package com.serhat.secondhand.listing.domain.entity.enums.common;

import java.util.UUID;

/**
 * Common interface for all lookup/reference entities that have id, name, and label fields.
 * Enables a single MapStruct mapping method for all lookup types.
 */
public interface Labelable {
    UUID getId();
    String getName();
    String getLabel();
}

