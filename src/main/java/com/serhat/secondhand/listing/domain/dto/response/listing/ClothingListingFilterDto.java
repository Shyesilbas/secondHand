package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class ClothingListingFilterDto extends ListingFilterDto {

    private List<UUID> brands;
    private List<UUID> types;
    private List<Color> colors;
    private List<ClothingCondition> conditions;
    /** WOMEN or MEN also match UNISEX listings. */
    private List<ClothingAudience> audiences;
    /** Narrows {@link #sizes} to one system; without it a key such as "38" matches in every system. */
    private String sizeSystem;
    private List<String> sizes;
    private Integer minPurchaseYear;
    private Integer maxPurchaseYear;
}
