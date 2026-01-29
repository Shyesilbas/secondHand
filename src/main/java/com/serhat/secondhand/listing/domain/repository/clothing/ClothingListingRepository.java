package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClothingListingRepository extends JpaRepository<ClothingListing, UUID> {
    
    List<ClothingListing> findByBrand_Id(UUID brandId);
    
    List<ClothingListing> findByClothingType_Id(UUID clothingTypeId);
    
    List<ClothingListing> findByCondition(ClothingCondition condition);
    
    List<ClothingListing> findByBrand_IdAndClothingType_Id(UUID brandId, UUID clothingTypeId);
    
    List<ClothingListing> findByPurchaseDateAfter(LocalDate startDate);
}
