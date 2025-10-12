package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ClothingListingFilterDto extends ListingFilterDto {
    
    private List<ClothingBrand> brands;
    private List<ClothingType> types;
    private List<Color> colors;
    private List<ClothingCondition> conditions;
    private List<ClothingGender> clothingGenders;
    private List<ClothingCategory> clothingCategories;
    private LocalDate minPurchaseDate;
    private LocalDate maxPurchaseDate;
}
