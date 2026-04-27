package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "clothing_listings")
@Getter @Setter
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

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    private ClothingCondition condition;

    @Enumerated(EnumType.STRING)
    private ClothingSize size;

    @Column(name = "shoe_size_eu")
    private Integer shoeSizeEu;

    @Column(name = "material", length = 120)
    private String material;

    @Enumerated(EnumType.STRING)
    @Column(name = "clothing_gender", nullable = false)
    private ClothingGender clothingGender;

    @Enumerated(EnumType.STRING)
    @Column(name = "clothing_category", nullable = false)
    private ClothingCategory clothingCategory;
}
