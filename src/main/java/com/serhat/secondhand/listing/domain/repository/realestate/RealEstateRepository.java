package com.serhat.secondhand.listing.domain.repository.realestate;

import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RealEstateRepository extends JpaRepository<RealEstateListing, UUID> {
}
