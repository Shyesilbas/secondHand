package com.serhat.secondhand.listing.domain.repository.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RealEstateTypeRepository extends JpaRepository<RealEstateType, UUID> {
    Optional<RealEstateType> findByNameIgnoreCase(String name);
}

