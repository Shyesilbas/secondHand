package com.serhat.secondhand.review.repository;

import com.serhat.secondhand.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM Review r WHERE r.reviewedUser.id = :userId")
    Double getUserAverageRating(@Param("userId") Long userId);

    Optional<Review> findByReviewerIdAndOrderItemId(Long reviewerId, Long orderItemId);

    List<Review> findByOrderItem_IdInAndReviewer_Id(List<Long> orderItemIds, Long reviewerId);

    Page<Review> findByReviewedUserIdOrderByCreatedAtDesc(Long reviewedUserId, Pageable pageable);

    Page<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);

    @Query("SELECT " +
            "COUNT(r), " +
            "AVG(CAST(r.rating AS double)), " +
            "SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 0 THEN 1 ELSE 0 END) " +
            "FROM Review r WHERE r.reviewedUser.id = :userId")
    List<Object[]> getUserReviewStats(@Param("userId") Long userId);

    @Query("SELECT " +
            "r.orderItem.listing.id, " +
            "COUNT(r), " +
            "AVG(CAST(r.rating AS double)) " +
            "FROM Review r WHERE r.orderItem.listing.id IN :listingIds " +
            "GROUP BY r.orderItem.listing.id")
    List<Object[]> getListingReviewStats(@Param("listingIds") List<UUID> listingIds);

    boolean existsByReviewerIdAndOrderItemId(Long reviewerId, Long orderItemId);

    @Query("SELECT r FROM Review r WHERE r.orderItem.listing.id = :listingId ORDER BY r.createdAt DESC")
    Page<Review> findReviewsByListingId(@Param("listingId") UUID listingId, Pageable pageable);
}