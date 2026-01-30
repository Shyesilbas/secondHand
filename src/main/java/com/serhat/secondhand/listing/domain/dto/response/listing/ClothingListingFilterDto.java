package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class ClothingListingFilterDto extends ListingFilterDto {
    
    private List<UUID> brands;
    private List<UUID> types;
    private List<Color> colors;
    private List<ClothingCondition> conditions;
    private List<ClothingGender> clothingGenders;
    private List<ClothingCategory> clothingCategories;
    private LocalDate minPurchaseDate;
    private LocalDate maxPurchaseDate;
    private List<ClothingSize> sizes;
    private Integer minShoeSizeEu;
    private Integer maxShoeSizeEu;
    private String material;
}
