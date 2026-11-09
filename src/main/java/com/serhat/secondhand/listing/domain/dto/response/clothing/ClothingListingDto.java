package com.serhat.secondhand.listing.domain.dto.response.clothing;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClothingListingDto extends ListingDto {

    private LookupDto brand;
    private LookupDto clothingType;
    private Color color;
    private Integer purchaseYear;
    private ClothingCondition condition;
    private ClothingAudience audience;
    private String sizeSystem;
    private String sizeKey;
    /** Display label from data/common/sizes.json, e.g. "W32 / L32". */
    private String sizeLabel;

    private ClothingFit fit;
    private ClothingPattern pattern;
    private FabricType fabricType;
}
