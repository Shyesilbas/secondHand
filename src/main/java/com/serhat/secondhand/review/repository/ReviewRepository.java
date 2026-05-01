package com.serhat.secondhand.review.repository;

import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.repository.projection.ListingReviewStatsProjection;
import com.serhat.secondhand.review.repository.projection.ReviewStatsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    String REVIEW_STATS_SELECT = "COUNT(r) AS totalReviews, " +
            "COALESCE(AVG(CAST(r.rating AS double)), 0.0) AS averageRating, " +
            "SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS fiveStarReviews, " +
            "SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS fourStarReviews, " +
            "SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS threeStarReviews, " +
            "SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS twoStarReviews, " +
            "SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS oneStarReviews, " +
            "SUM(CASE WHEN r.rating = 0 THEN 1 ELSE 0 END) AS zeroStarReviews";

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM Review r WHERE r.reviewedUser.id = :userId")
    Double getUserAverageRating(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {"reviewer", "reviewedUser", "orderItem", "orderItem.listing"})
    Optional<Review> findByReviewerIdAndOrderItemId(Long reviewerId, Long orderItemId);

    @EntityGraph(attributePaths = {"reviewer", "reviewedUser", "orderItem", "orderItem.listing"})
    List<Review> findByOrderItem_IdInAndReviewer_Id(List<Long> orderItemIds, Long reviewerId);

    @EntityGraph(attributePaths = {"reviewer", "reviewedUser", "orderItem", "orderItem.listing"})
    Page<Review> findByReviewedUserIdOrderByCreatedAtDesc(Long reviewedUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"reviewer", "reviewedUser", "orderItem", "orderItem.listing"})
    Page<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);

    @Query("SELECT " + REVIEW_STATS_SELECT + " FROM Review r WHERE r.reviewedUser.id = :userId")
    ReviewStatsProjection getUserReviewStats(@Param("userId") Long userId);

    @Query("SELECT " +
            "l.id AS listingId, " +
            REVIEW_STATS_SELECT + " " +
            "FROM Review r " +
            "JOIN r.orderItem oi " +
            "JOIN oi.listing l " +
            "WHERE l.id IN :listingIds " +
            "GROUP BY l.id")
    List<ListingReviewStatsProjection> getListingReviewStats(@Param("listingIds") List<UUID> listingIds);

    boolean existsByReviewerIdAndOrderItemId(Long reviewerId, Long orderItemId);

    @EntityGraph(attributePaths = {"reviewer", "reviewedUser", "orderItem", "orderItem.listing"})
    @Query("SELECT r FROM Review r WHERE r.orderItem.listing.id = :listingId ORDER BY r.createdAt DESC")
    Page<Review> findReviewsByListingId(@Param("listingId") UUID listingId, Pageable pageable);

    long countByReviewerId(Long reviewerId);
}