package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "clothing_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class ClothingListing extends Listing {

    @Enumerated(EnumType.STRING)
    private ClothingBrand brand;

    @Enumerated(EnumType.STRING)
    private ClothingType clothingType;

    @Enumerated(EnumType.STRING)
    private Color color;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    private ClothingCondition condition;
}
