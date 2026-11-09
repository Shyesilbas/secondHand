package com.serhat.secondhand.ai.agent.search;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.math.BigDecimal;

/**
 * LLM veya sezgisel çıkarım ile üretilen zenginleştirilmiş arama planı.
 */
public record SearchPlan(
        SearchPlanMode mode,
        String searchQuery,
        ListingType category,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String city,
        String district,
        Integer minYear,
        Integer maxYear,
        Integer maxMileage,
        Integer minRam,
        Integer minStorage,
        Integer minRoomCount,
        int resultSize,
        boolean explicitNone
) {
    public static SearchPlan none() {
        return new SearchPlan(SearchPlanMode.NONE, null, null, null, null, null, null, null, null, null, null, null, null, 0, false);
    }

    public static SearchPlan noneExplicit() {
        return new SearchPlan(SearchPlanMode.NONE, null, null, null, null, null, null, null, null, null, null, null, null, 0, true);
    }

    public static SearchPlan global(String query, int size) {
        return new SearchPlan(SearchPlanMode.GLOBAL_TEXT, query, null, null, null, null, null, null, null, null, null, null, null, size, false);
    }

    public static SearchPlan category(ListingType type, BigDecimal minPrice, BigDecimal maxPrice, int size) {
        return new SearchPlan(SearchPlanMode.CATEGORY_FILTER, null, type, minPrice, maxPrice, null, null, null, null, null, null, null, null, size, false);
    }
}
