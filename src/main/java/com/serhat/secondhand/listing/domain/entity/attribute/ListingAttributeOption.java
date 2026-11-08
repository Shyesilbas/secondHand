package com.serhat.secondhand.listing.domain.entity.attribute;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/** Allowed value of an ENUM-like attribute; {@code KEY} options are the keys of an {@code ENUM_MAP}. */
@Entity
@Table(name = "listing_attribute_options")
@Getter
@Setter
@NoArgsConstructor
public class ListingAttributeOption {

    public static final String GROUP_VALUE = "VALUE";
    public static final String GROUP_KEY = "KEY";

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "definition_id", nullable = false)
    private ListingAttributeDefinition definition;

    @Column(name = "option_group", nullable = false, length = 20)
    private String optionGroup = GROUP_VALUE;

    @Column(nullable = false, length = 100)
    private String value;

    @Column(nullable = false, length = 150)
    private String label;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
