package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    
    List<Listing> findByStatus(ListingStatus status);
    
    List<Listing> findBySeller(User seller);
    
    List<Listing> findBySellerOrderByCreatedAtDesc(User seller);
    
    List<Listing> findBySellerAndStatus(User seller, ListingStatus status);
}
