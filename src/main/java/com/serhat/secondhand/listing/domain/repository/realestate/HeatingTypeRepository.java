package com.serhat.secondhand.listing.domain.repository.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HeatingTypeRepository extends JpaRepository<HeatingType, UUID> {
    Optional<HeatingType> findByNameIgnoreCase(String name);
}

