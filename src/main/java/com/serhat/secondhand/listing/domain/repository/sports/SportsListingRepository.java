package com.serhat.secondhand.listing.domain.repository.sports;

import com.serhat.secondhand.listing.domain.entity.SportsListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SportsListingRepository extends JpaRepository<SportsListing, UUID> {
}


