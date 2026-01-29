package com.serhat.secondhand.listing.domain.repository.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ListingOwnerTypeRepository extends JpaRepository<ListingOwnerType, UUID> {
    Optional<ListingOwnerType> findByNameIgnoreCase(String name);
}

