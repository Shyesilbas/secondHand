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
    
        boolean existsByUserAndListingId(User user, UUID listingId);
    
        @Query("SELECT f.user FROM Favorite f WHERE f.listing.id = :listingId")
    List<User> findUsersByListingId(@Param("listingId") UUID listingId);
        @Query("SELECT f FROM Favorite f " +
           "JOIN FETCH f.listing l " +
           "JOIN FETCH f.user u " +
           "WHERE f.user = :user " +
           "ORDER BY f.createdAt DESC")
    Page<Favorite> findByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
    
        long countByListingId(UUID listingId);
    
        @Query("SELECT f.listing.id, COUNT(f) FROM Favorite f " +
           "WHERE f.listing.id IN :listingIds " +
           "GROUP BY f.listing.id")
    List<Object[]> countByListingIds(@Param("listingIds") List<UUID> listingIds);
    
        void deleteByUserAndListingId(User user, UUID listingId);
    
        @Query("SELECT f.user.id FROM Favorite f WHERE f.listing.id = :listingId")
    List<Long> findUserIdsByListingId(@Param("listingId") UUID listingId);
    
        @Query("SELECT f.listing.id, COUNT(f) as favoriteCount FROM Favorite f " +
           "JOIN f.listing l " +
           "WHERE l.status = 'ACTIVE' " +
           "GROUP BY f.listing.id " +
           "ORDER BY favoriteCount DESC")
    Page<Object[]> findTopFavoritedListings(Pageable pageable);
    
        @Query("SELECT f.listing.id FROM Favorite f WHERE f.user = :user")
    List<UUID> findListingIdsByUser(@Param("user") User user);
    
        @Query("SELECT f.listing.id FROM Favorite f WHERE f.user.email = :userEmail")
    List<UUID> findListingIdsByUserEmail(@Param("userEmail") String userEmail);
    
        boolean existsByUserEmailAndListingId(String userEmail, UUID listingId);
}