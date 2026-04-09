package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CarBrandRepository extends JpaRepository<CarBrand, UUID> {
    
    @Cacheable(value = "brands", key = "'all'")
    List<CarBrand> findAll();
    
    @Cacheable(value = "brands", key = "#name")
    Optional<CarBrand> findByNameIgnoreCase(String name);
}

