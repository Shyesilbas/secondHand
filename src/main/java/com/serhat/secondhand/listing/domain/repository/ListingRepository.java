package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    
    List<Listing> findByStatus(ListingStatus status);
    
    List<Listing> findBySeller(User seller);
    
    List<Listing> findBySellerOrderByCreatedAtDesc(User seller);
    
    List<Listing> findBySellerAndStatus(User seller, ListingStatus status);
    
    // Statistics queries
    
    /**
     * Get total count of all listings
     */
    @Query("SELECT COUNT(l) FROM Listing l")
    long getTotalListingCount();
    
    /**
     * Get total count of active listings
     */
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.status = :status")
    long getListingCountByStatus(ListingStatus status);
    
    /**
     * Get count of unique users who have active listings
     */
    @Query("SELECT COUNT(DISTINCT l.seller) FROM Listing l WHERE l.status = :status")
    long getActiveSellerCount(ListingStatus status);
    
    /**
     * Get count of unique cities that have active listings
     */
    @Query("SELECT COUNT(DISTINCT l.city) FROM Listing l WHERE l.status = :status AND l.city IS NOT NULL")
    long getActiveCityCount(ListingStatus status);
}
