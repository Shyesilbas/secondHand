package com.serhat.secondhand.favorite.domain.repository;

import com.serhat.secondhand.favorite.domain.entity.Favorite;
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
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    /**
     * Check if a user has favorited a specific listing
     */
    boolean existsByUserAndListingId(User user, UUID listingId);
    
    /**
     * Find favorite by user and listing
     */
    Optional<Favorite> findByUserAndListingId(User user, UUID listingId);
    
    /**
     * Get all favorites for a user
     */
    @Query("SELECT f FROM Favorite f " +
           "JOIN FETCH f.listing l " +
           "JOIN FETCH f.user u " +
           "WHERE f.user = :user " +
           "ORDER BY f.createdAt DESC")
    Page<Favorite> findByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
    
    /**
     * Get favorite count for a specific listing
     */
    long countByListingId(UUID listingId);
    
    /**
     * Get favorite count for multiple listings
     */
    @Query("SELECT f.listing.id, COUNT(f) FROM Favorite f " +
           "WHERE f.listing.id IN :listingIds " +
           "GROUP BY f.listing.id")
    List<Object[]> countByListingIds(@Param("listingIds") List<UUID> listingIds);
    
    /**
     * Delete favorite by user and listing
     */
    void deleteByUserAndListingId(User user, UUID listingId);
    
    /**
     * Get all users who favorited a specific listing
     */
    @Query("SELECT f.user.id FROM Favorite f WHERE f.listing.id = :listingId")
    List<Long> findUserIdsByListingId(@Param("listingId") UUID listingId);
    
    /**
     * Get top favorited listings
     */
    @Query("SELECT f.listing.id, COUNT(f) as favoriteCount FROM Favorite f " +
           "JOIN f.listing l " +
           "WHERE l.status = 'ACTIVE' " +
           "GROUP BY f.listing.id " +
           "ORDER BY favoriteCount DESC")
    Page<Object[]> findTopFavoritedListings(Pageable pageable);
    
    /**
     * Get user's favorite listing IDs for quick lookup
     */
    @Query("SELECT f.listing.id FROM Favorite f WHERE f.user = :user")
    List<UUID> findListingIdsByUser(@Param("user") User user);
    
    /**
     * Get user's favorite listing IDs by email (for nullable operations)
     */
    @Query("SELECT f.listing.id FROM Favorite f WHERE f.user.email = :userEmail")
    List<UUID> findListingIdsByUserEmail(@Param("userEmail") String userEmail);
    
    /**
     * Check if user favorited listing by email (for nullable operations)
     */
    boolean existsByUserEmailAndListingId(String userEmail, UUID listingId);
}