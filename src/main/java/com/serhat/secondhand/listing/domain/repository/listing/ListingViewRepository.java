package com.serhat.secondhand.listing.domain.repository.listing;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.ListingView;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ListingViewRepository extends JpaRepository<ListingView, UUID> {

    long countByListingAndViewedAtBetween(Listing listing, LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "SELECT COUNT(DISTINCT " +
           "CASE " +
           "  WHEN lv.user_id IS NOT NULL THEN CAST(lv.user_id AS VARCHAR) " +
           "  ELSE lv.session_id " +
           "END) " +
           "FROM listing_views lv " +
           "WHERE lv.listing_id = :listingId " +
           "AND lv.viewed_at BETWEEN :startDate AND :endDate", nativeQuery = true)
    long countDistinctUserOrSessionByListingAndViewedAtBetween(
            @Param("listingId") UUID listingId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<ListingView> findByListingAndViewedAtBetween(Listing listing, LocalDateTime startDate, LocalDateTime endDate);

    boolean existsByListingAndUserAndViewedAtAfter(Listing listing, User user, LocalDateTime after);

    boolean existsByListingAndSessionIdAndViewedAtAfter(Listing listing, String sessionId, LocalDateTime after);

    @Query("SELECT CAST(lv.viewedAt AS DATE), COUNT(lv) " +
           "FROM ListingView lv " +
           "WHERE lv.listing.id = :listingId " +
           "AND lv.viewedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(lv.viewedAt AS DATE) " +
           "ORDER BY CAST(lv.viewedAt AS DATE)")
    List<Object[]> countViewsByDate(
            @Param("listingId") UUID listingId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}

