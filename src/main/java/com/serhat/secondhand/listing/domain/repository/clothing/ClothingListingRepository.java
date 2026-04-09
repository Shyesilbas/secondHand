package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClothingListingRepository extends JpaRepository<ClothingListing, UUID> {
    
    @EntityGraph(attributePaths = {"seller", "brand", "clothingType"})
    Page<ClothingListing> findByBrand_Id(UUID brandId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"seller", "brand", "clothingType"})
    Page<ClothingListing> findByClothingType_Id(UUID clothingTypeId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"seller", "brand", "clothingType"})
    Page<ClothingListing> findByCondition(ClothingCondition condition, Pageable pageable);
    
    @EntityGraph(attributePaths = {"seller", "brand", "clothingType"})
    Page<ClothingListing> findByBrand_IdAndClothingType_Id(UUID brandId, UUID clothingTypeId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"seller", "brand", "clothingType"})
    Page<ClothingListing> findByPurchaseDateAfter(LocalDate startDate, Pageable pageable);
}
