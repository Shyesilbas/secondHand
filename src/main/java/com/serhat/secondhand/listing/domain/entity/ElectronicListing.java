package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "electronic_listings")
@Getter @Setter
@NoArgsConstructor
@SuperBuilder
 @org.hibernate.annotations.BatchSize(size = 20)
public class ElectronicListing extends Listing {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "electronic_type_id")
    private ElectronicType electronicType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "electronic_brand_id")
    private ElectronicBrand electronicBrand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "electronic_model_id")
    private ElectronicModel model;

    /** Catalog variant the seller picked; its facts and the model's specs are copied on save. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "electronic_variant_id")
    private ElectronicModelVariant variant;

    private String origin;

    protected boolean warrantyProof;

    private Integer year;

    @Enumerated(EnumType.STRING)
    private Color color;

    /** Official color name of the model (ElectronicModel.colors); {@link #color} is derived from it. */
    @Column(name = "color_name", length = 100)
    private String colorName;


    private Integer ram;

    private Integer storage;

    @Enumerated(EnumType.STRING)
    private StorageType storageType;

    @Enumerated(EnumType.STRING)
    private Processor processor;

    /** Exact chip, e.g. "Apple A18 Pro" or "Intel Core i7-13700H"; processor stays the family. */
    @Column(length = 150)
    private String chipset;

    private Integer screenSize;

    private String gpuModel;

    private String operatingSystem;


    private Integer batteryCapacityMah;

    private Integer cameraMegapixels;

    private Boolean supports5g;

    private Boolean dualSim;

    private Boolean hasNfc;

    @Enumerated(EnumType.STRING)
    private ElectronicConnectionType connectionType;

    private Boolean wireless;

    private Boolean noiseCancelling;

    private Boolean hasMicrophone;

    private Integer batteryLifeHours;


    @Enumerated(EnumType.STRING)
    @Column(name = "condition", nullable = false)
    private ElectronicCondition condition;


    /** Condition attributes are defined per electronic type (data/attributes/electronics.json scopes). */
    @Override
    public String attributeScopeKey() {
        return electronicType != null ? electronicType.getName() : null;
    }
}
