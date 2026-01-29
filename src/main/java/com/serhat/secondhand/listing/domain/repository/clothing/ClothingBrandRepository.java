package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClothingBrandRepository extends JpaRepository<ClothingBrand, UUID> {
    Optional<ClothingBrand> findByNameIgnoreCase(String name);
}

