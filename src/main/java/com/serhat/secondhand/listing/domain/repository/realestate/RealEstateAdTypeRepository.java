package com.serhat.secondhand.listing.domain.repository.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RealEstateAdTypeRepository extends JpaRepository<RealEstateAdType, UUID> {
    Optional<RealEstateAdType> findByNameIgnoreCase(String name);
}

