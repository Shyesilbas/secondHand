package com.serhat.secondhand.listing.domain.dto.response.clothing;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClothingListingDto extends ListingDto {

    private LookupDto brand;
    private LookupDto clothingType;
    private Color color;
    private LocalDate purchaseDate;
    private ClothingCondition condition;
    private ClothingSize size;
    private Integer shoeSizeEu;
    private String material;
    private ClothingGender clothingGender;
    private ClothingCategory clothingCategory;
}
