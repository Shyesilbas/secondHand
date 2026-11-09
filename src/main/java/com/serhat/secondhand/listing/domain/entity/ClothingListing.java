package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "clothing_listings")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@org.hibernate.annotations.BatchSize(size = 20)
public class ClothingListing extends Listing {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clothing_brand_id")
    private ClothingBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clothing_type_id")
    private ClothingType clothingType;

    @Enumerated(EnumType.STRING)
    private Color color;

    /** Optional; the year the seller bought the item. */
    @Column(name = "purchase_year")
    private Integer purchaseYear;

    @Enumerated(EnumType.STRING)
    private ClothingCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", nullable = false, length = 20)
    private ClothingAudience audience;

    /** Size system key (data/common/sizes.json), allowed by the type for the audience. */
    @Column(name = "size_system", length = 30)
    private String sizeSystem;

    /** Size value key inside {@link #sizeSystem}. */
    @Column(name = "size_key", length = 30)
    private String sizeKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "clothing_fit", length = 30)
    private com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit fit;

    @Enumerated(EnumType.STRING)
    @Column(name = "clothing_pattern", length = 30)
    private com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern pattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "fabric_type", length = 30)
    private com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType fabricType;

    /** Condition attributes are defined per type group (data/attributes/clothing.json scopes). */
    @Override
    public String attributeScopeKey() {
        return clothingType != null && clothingType.getGroup() != null ? clothingType.getGroup().name() : null;
    }
}
