package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {

    // Not cached: these are JPA entities (lazy proxies, mutable seed rows). EnumReadService caches its DTO output.
    List<VehicleType> findAll();

    Optional<VehicleType> findByNameIgnoreCase(String name);
}

