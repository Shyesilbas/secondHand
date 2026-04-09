package com.serhat.secondhand.listing.util;

public final class ListingConstants {
    
    private ListingConstants() {
        throw new UnsupportedOperationException("Utility class");
    }
    
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int SEARCH_PAGE_SIZE = 8;
    public static final int MY_LISTINGS_PAGE_SIZE = 20;
    
    public static final String SORT_BY_CREATED_AT = "createdAt";
    public static final String SORT_DIRECTION_DESC = "DESC";
    public static final String SORT_DIRECTION_ASC = "ASC";
    
    public static final String MSG_LISTING_NOT_FOUND = "listing.not.found";
    public static final String MSG_LISTING_REQUIRED = "listing.required";
    public static final String MSG_PRICE_UPDATED = "listing.price.updated";
    public static final String MSG_INITIAL_PRICE = "Initial price";
    public static final String MSG_PRICE_CHANGE_DEFAULT = "Price updated";
    
    public static final String ERROR_VALIDATION = "VALIDATION_ERROR";
    public static final String ERROR_LISTING_REQUIRED = "LISTING_REQUIRED";
    public static final String ERROR_LISTING_NOT_FOUND = "LISTING_NOT_FOUND";
}
