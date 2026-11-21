package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.listing.application.port.ListingSalesRankingPort;
import com.serhat.secondhand.listing.domain.dto.response.listing.BestSellerRanking;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ListingSalesRankingService {

    public static final String BEST_SELLERS_CACHE = "listing:bestSellers";

    private final ListingSalesRankingPort salesRankingPort;

    /**
     * One GROUP BY over order_items per TTL window (CacheConfig, aggregation tier) instead of one per home-page visit.
     * Expiry only: a listing that leaves ACTIVE meanwhile is dropped by {@link ListingBestSellerService} on read.
     */
    @Cacheable(value = BEST_SELLERS_CACHE, key = "'global'")
    public BestSellerRanking getBestSellerRanking() {
        return new BestSellerRanking(
                salesRankingPort.findTopSellingActiveListingIds(ListingBusinessConstants.BEST_SELLER_POOL_SIZE));
    }
}
