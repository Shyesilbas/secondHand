package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Unified Social Proof metrics DTO (views in last 24h, active in-cart users, favorite count).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ListingSocialProofDto implements Serializable {

    /**
     * Number of distinct users who viewed this listing in the last 24 hours.
     */
    private int viewsLast24Hours;

    /**
     * Number of distinct users who currently hold this listing in their active cart.
     */
    private int inCartCount;

    /**
     * Total number of users who added this listing to favorites.
     */
    private long favoriteCount;
}
