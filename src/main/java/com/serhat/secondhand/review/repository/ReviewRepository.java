package com.serhat.secondhand.review.repository;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.user.domain.entity.User;
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

    /**
     * Find review by reviewer and order item (to check if review already exists)
     */
    Optional<Review> findByReviewerAndOrderItem(User reviewer, OrderItem orderItem);

    /**
     * Find all reviews for a specific user (reviews received by the user)
     */
    Page<Review> findByReviewedUserOrderByCreatedAtDesc(User reviewedUser, Pageable pageable);

    /**
     * Find all reviews written by a specific user
     */
    Page<Review> findByReviewerOrderByCreatedAtDesc(User reviewer, Pageable pageable);

    /**
     * Get review statistics for a user
     */
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


    /**
     * Find reviews by order item IDs (to get reviews for multiple order items)
     */
    List<Review> findByOrderItemIn(List<OrderItem> orderItems);

    /**
     * Find reviews for a specific listing (reviews about the listing, not the seller)
     */
    @Query("SELECT r FROM Review r WHERE r.orderItem.listing.id = :listingId ORDER BY r.createdAt DESC")
    Page<Review> findByOrderItemListingIdOrderByCreatedAtDesc(@Param("listingId") UUID listingId, Pageable pageable);

    /**
     * Get review statistics for a specific listing
     */
    @Query("SELECT " +
            "COUNT(r), " +
            "AVG(CAST(r.rating AS double)), " +
            "SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 0 THEN 1 ELSE 0 END) " +
            "FROM Review r WHERE r.orderItem.listing.id = :listingId")
    List<Object[]> getListingReviewStats(@Param("listingId") UUID listingId);

    /**
     * Check if user has already reviewed a specific order item
     */
    boolean existsByReviewerAndOrderItem(User reviewer, OrderItem orderItem);
}
