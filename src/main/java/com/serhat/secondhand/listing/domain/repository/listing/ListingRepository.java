package com.serhat.secondhand.listing.domain.repository.listing;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;

import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    
    List<Listing> findByStatus(ListingStatus status);
    
    List<Listing> findByListingType(ListingType listingType);
    
    List<Listing> findByListingTypeAndStatus(ListingType listingType, ListingStatus status);
    
    List<Listing> findByListingTypeOrderByCreatedAtDesc(ListingType listingType);
    
    List<Listing> findBySeller(User seller);
    
    List<Listing> findBySellerOrderByCreatedAtDesc(User seller);
    
    List<Listing> findBySellerAndStatus(User seller, ListingStatus status);
    
        Optional<Listing> findByListingNo(String listingNo);
    
        
        @Query("SELECT COUNT(l) FROM Listing l")
    long getTotalListingCount();
    
        @Query("SELECT COUNT(l) FROM Listing l WHERE l.status = :status")
    long getListingCountByStatus(ListingStatus status);
    
        @Query("SELECT COUNT(DISTINCT l.seller) FROM Listing l WHERE l.status = :status")
    long getActiveSellerCount(ListingStatus status);
    
        @Query("SELECT COUNT(DISTINCT l.city) FROM Listing l WHERE l.status = :status AND l.city IS NOT NULL")
    long getActiveCityCount(ListingStatus status);
}
