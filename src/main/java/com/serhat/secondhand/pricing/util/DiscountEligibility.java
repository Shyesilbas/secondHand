package com.serhat.secondhand.pricing.util;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Single home of the rule which listing verticals may receive seller campaigns or platform coupons.
 * Campaign and coupon validators, listing campaign enrichment and the pricing engine all read it from here.
 */
public final class DiscountEligibility {

    public static final Set<ListingType> NON_DISCOUNTABLE_TYPES =
            Collections.unmodifiableSet(EnumSet.of(ListingType.REAL_ESTATE, ListingType.VEHICLE));

    private DiscountEligibility() {
    }

    public static boolean isDiscountable(ListingType type) {
        return !NON_DISCOUNTABLE_TYPES.contains(type);
    }

    public static boolean containsNonDiscountable(Collection<ListingType> types) {
        return types != null && types.stream().anyMatch(NON_DISCOUNTABLE_TYPES::contains);
    }

    public static Set<ListingType> discountableTypes() {
        return EnumSet.complementOf(EnumSet.copyOf(NON_DISCOUNTABLE_TYPES));
    }
}
