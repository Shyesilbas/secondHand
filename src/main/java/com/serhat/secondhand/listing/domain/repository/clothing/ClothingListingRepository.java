package com.serhat.secondhand.listing.domain.repository.clothing;

import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClothingListingRepository extends JpaRepository<ClothingListing, UUID> {
    
    List<ClothingListing> findByBrand(ClothingBrand brand);
    
    List<ClothingListing> findByClothingType(ClothingType clothingType);
    
    List<ClothingListing> findByCondition(ClothingCondition condition);
    
    @Query("SELECT c FROM ClothingListing c WHERE c.brand = :brand AND c.clothingType = :clothingType")
    List<ClothingListing> findByBrandAndClothingType(@Param("brand") ClothingBrand brand, 
                                            @Param("clothingType") ClothingType clothingType);
    
    @Query("SELECT c FROM ClothingListing c WHERE c.purchaseDate >= :startDate")
    List<ClothingListing> findByPurchaseDateAfter(@Param("startDate") LocalDate startDate);
}
