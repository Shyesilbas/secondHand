package com.serhat.secondhand.ai.agent.search;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.math.BigDecimal;

/**
 * LLM veya sezgisel çıkarım ile üretilen arama planı.
 */
public record SearchPlan(
        SearchPlanMode mode,
        String searchQuery,
        ListingType category,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        int resultSize
) {
    public static SearchPlan none() {
        return new SearchPlan(SearchPlanMode.NONE, null, null, null, null, 0);
    }

    public static SearchPlan global(String query, int size) {
        return new SearchPlan(SearchPlanMode.GLOBAL_TEXT, query, null, null, null, size);
    }

    public static SearchPlan category(ListingType type, BigDecimal minPrice, BigDecimal maxPrice, int size) {
        return new SearchPlan(SearchPlanMode.CATEGORY_FILTER, null, type, minPrice, maxPrice, size);
    }
}
