package com.serhat.secondhand.favorite.domain.repository;

import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
        boolean existsByUserAndListingId(User user, UUID listingId);
    
        long countByListingId(UUID listingId);
    
        @Query("SELECT f.listing.id, COUNT(f) FROM Favorite f " +
           "WHERE f.listing.id IN :listingIds " +
           "GROUP BY f.listing.id")
    List<Object[]> countByListingIds(@Param("listingIds") List<UUID> listingIds);
    
        void deleteByUserAndListingId(User user, UUID listingId);

    
        @Query("SELECT f.listing.id, COUNT(f) as favoriteCount FROM Favorite f " +
           "JOIN f.listing l " +
           "WHERE l.status = :status " +
           "GROUP BY f.listing.id " +
           "ORDER BY favoriteCount DESC")
    Page<Object[]> findTopFavoritedListings(@Param("status") ListingStatus status, Pageable pageable);

    @Query("SELECT f.listing.id FROM Favorite f " +
           "JOIN f.listing l " +
           "WHERE l.status = :status " +
           "GROUP BY f.listing.id " +
           "ORDER BY COUNT(f) DESC")
    List<UUID> findTopFavoritedListingIds(@Param("status") ListingStatus status, Pageable pageable);
    
        @Query("SELECT f.listing.id FROM Favorite f WHERE f.user = :user")
    List<UUID> findListingIdsByUser(@Param("user") User user);
    
    @Query("SELECT f.listing.id FROM Favorite f WHERE f.user.id = :userId")
    List<UUID> findListingIdsByUserId(@Param("userId") Long userId);

    @Query("SELECT f.listing.id FROM Favorite f WHERE f.user.id = :userId AND f.listing.id IN :listingIds")
    List<UUID> findListingIdsByUserIdAndListingIdIn(@Param("userId") Long userId, @Param("listingIds") List<UUID> listingIds);

    boolean existsByUserIdAndListingId(Long userId, UUID listingId);

        @Query("SELECT COUNT(f) FROM Favorite f WHERE f.listing.seller.id = :sellerId")
        long countByListingSellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT f FROM Favorite f " +
            "JOIN FETCH f.listing l " +
            "JOIN FETCH l.seller " +
            "WHERE f.user = :user ORDER BY f.createdAt DESC")
    Page<Favorite> findByUserWithListingAndSeller(@Param("user") User user, Pageable pageable);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Favorite f WHERE f.user = :user AND f.listing.id = :listingId")
    int deleteByUserAndListingIdIfExists(@Param("user") User user, @Param("listingId") UUID listingId);

    @Query("SELECT DISTINCT f.user FROM Favorite f WHERE f.listing.id = :listingId")
    List<User> findUsersByListingId(@Param("listingId") UUID listingId);

    Long countByUserId(Long buyerId);
}