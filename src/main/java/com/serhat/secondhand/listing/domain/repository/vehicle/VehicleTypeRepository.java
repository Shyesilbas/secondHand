package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {
    
    @Cacheable(value = "vehicleTypes", key = "'all'")
    List<VehicleType> findAll();
    
    @Cacheable(value = "vehicleTypes", key = "#name")
    Optional<VehicleType> findByNameIgnoreCase(String name);
}

