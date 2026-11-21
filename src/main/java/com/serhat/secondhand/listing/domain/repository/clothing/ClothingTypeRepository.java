package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClothingTypeRepository extends JpaRepository<ClothingType, UUID> {

    // Not cached: these are JPA entities (lazy proxies, mutable seed rows). EnumReadService caches its DTO output.
    List<ClothingType> findAll();

    Optional<ClothingType> findByNameIgnoreCase(String name);
}

