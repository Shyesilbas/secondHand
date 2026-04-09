package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClothingTypeRepository extends JpaRepository<ClothingType, UUID> {
    
    @Cacheable(value = "clothingTypes", key = "'all'")
    List<ClothingType> findAll();
    
    @Cacheable(value = "clothingTypes", key = "#name")
    Optional<ClothingType> findByNameIgnoreCase(String name);
}

