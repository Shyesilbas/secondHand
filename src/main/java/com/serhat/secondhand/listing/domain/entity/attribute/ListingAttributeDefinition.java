package com.serhat.secondhand.listing.domain.entity.attribute;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** One attribute a listing type accepts; {@code scopeKey} narrows it (e.g. vehicle type CAR), {@code ALL} = every scope. */
@Entity
@Table(name = "listing_attribute_definitions")
@Getter
@Setter
@NoArgsConstructor
public class ListingAttributeDefinition {

    public static final String ALL_SCOPES = "ALL";

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false, length = 50)
    private ListingType listingType;

    @Column(name = "scope_key", nullable = false, length = 100)
    private String scopeKey = ALL_SCOPES;

    @Column(name = "attr_key", nullable = false, length = 100)
    private String attrKey;

    @Column(nullable = false, length = 150)
    private String label;

    @Column(length = 30)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false, length = 30)
    private AttributeDataType dataType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttributeLevel level;

    @Column(name = "min_value", precision = 19, scale = 4)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 19, scale = 4)
    private BigDecimal maxValue;

    @Column(nullable = false)
    private boolean required;

    @Column(nullable = false)
    private boolean filterable;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false, length = 30)
    private String source;

    @OneToMany(mappedBy = "definition", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("optionGroup ASC, sortOrder ASC")
    private List<ListingAttributeOption> options = new ArrayList<>();
}
