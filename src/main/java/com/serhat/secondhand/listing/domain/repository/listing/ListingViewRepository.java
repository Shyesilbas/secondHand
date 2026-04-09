package com.serhat.secondhand.listing.domain.repository.listing;

import com.serhat.secondhand.listing.domain.entity.ListingView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ListingViewRepository extends JpaRepository<ListingView, UUID> {


    long countByListingIdAndViewedAtBetween(UUID listingId, LocalDateTime startDate, LocalDateTime endDate);


    boolean existsByListingIdAndUserIdAndViewedAtAfter(UUID listingId, Long userId, LocalDateTime after);

    boolean existsByListingIdAndSessionIdAndViewedAtAfter(UUID listingId, String sessionId, LocalDateTime after);



    @Query(value = "SELECT COUNT(v.id), COUNT(DISTINCT COALESCE(v.user_id::text, v.session_id)) " +
            "FROM listing_views v " +
            "JOIN listings l ON v.listing_id = l.id " +
            "WHERE l.seller_id = :sellerId " +
            "AND v.viewed_at BETWEEN :startDate AND :endDate", nativeQuery = true)
    List<Object[]> getAggregatedStats(@Param("sellerId") Long sellerId,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT 
                COUNT(*) as total_views,
                COUNT(DISTINCT CASE WHEN lv.user_id IS NOT NULL THEN CAST(lv.user_id AS VARCHAR) ELSE lv.session_id END) as unique_views,
                CAST(lv.viewed_at AS DATE) as view_date,
                COUNT(*) as daily_count
            FROM listing_views lv
            WHERE lv.listing_id = :listingId
            AND lv.viewed_at BETWEEN :startDate AND :endDate
            GROUP BY CAST(lv.viewed_at AS DATE)
            ORDER BY view_date
            """, nativeQuery = true)
    List<Object[]> getViewStatisticsWithDailyBreakdown(
            @Param("listingId") UUID listingId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}