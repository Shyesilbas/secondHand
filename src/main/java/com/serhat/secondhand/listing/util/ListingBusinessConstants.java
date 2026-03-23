package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.Set;

public final class ListingBusinessConstants {

    private ListingBusinessConstants() {
    }

    /** Rolling window for duplicate view detection (listing views). */
    public static final int VIEW_DUPLICATE_WINDOW_HOURS = 1;

    public static final int MAX_USER_AGENT_LENGTH = 500;

    /** Days lookback for seller view statistics on listing detail. */
    public static final int DEFAULT_VIEW_STATS_WINDOW_DAYS = 7;

    /** Page size when loading a preview of reviews on a listing DTO. */
    public static final int REVIEWS_PAGE_SIZE = 10;

    /** Zero-based index for the first page of reviews. */
    public static final int DEFAULT_PAGE_INDEX = 0;

    /** Property name used when sorting listings by creation time (newest first). */
    public static final String LISTING_SORT_PROPERTY_CREATED_AT = "createdAt";

    /**
     * Listing types that do not load inline reviews on the listing DTO
     * (handled elsewhere or not applicable).
     */
    public static final Set<ListingType> LISTING_TYPES_EXCLUDED_FROM_INLINE_REVIEWS =
            EnumSet.of(ListingType.VEHICLE, ListingType.REAL_ESTATE);

    /** Minimum allowed quantity when updating listing stock. */
    public static final int MIN_LISTING_QUANTITY = 1;

    /** Divisor when converting a percentage tax rate to a fraction of 100. */
    public static final BigDecimal PERCENT_DIVISOR = BigDecimal.valueOf(100);

    /** Decimal scale for fee + tax amount calculations. */
    public static final int FEE_TAX_CALCULATION_SCALE = 2;

    public static final RoundingMode FEE_TAX_ROUNDING_MODE = RoundingMode.HALF_UP;

    /** Floor for non-negative listing price validation. */
    public static final BigDecimal MIN_NON_NEGATIVE_PRICE = BigDecimal.ZERO;

    public static final String ERROR_MESSAGE_LISTING_REQUIRED = "Listing is required";
    public static final String ERROR_CODE_LISTING_REQUIRED = "LISTING_REQUIRED";

    public static final String ERROR_MESSAGE_QUANTITY_AT_LEAST_ONE = "Quantity must be at least 1";

    public static final String ERROR_MESSAGE_PRICE_NON_NEGATIVE = "Price must be non-negative";
    public static final String ERROR_CODE_INVALID_PRICE = "INVALID_PRICE";
}
