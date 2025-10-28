package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "electronic_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class ElectronicListing extends Listing {

    @Enumerated(EnumType.STRING)
    private ElectronicType electronicType;

    @Enumerated(EnumType.STRING)
    private ElectronicBrand electronicBrand;

    private String model;

    private String origin;

    protected boolean warrantyProof;

    private Integer year;

    @Enumerated(EnumType.STRING)
    private Color color;


    private Integer ram;

    private Integer storage;

    @Enumerated(EnumType.STRING)
    private Processor processor;

    private Integer screenSize;

}
