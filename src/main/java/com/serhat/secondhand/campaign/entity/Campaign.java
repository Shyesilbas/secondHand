package com.serhat.secondhand.campaign.entity;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User seller;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean active;

    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignDiscountKind discountKind;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal value;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "campaign_eligible_types", joinColumns = @JoinColumn(name = "campaign_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type")
    private Set<ListingType> eligibleTypes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "campaign_eligible_listings", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "listing_id")
    private Set<UUID> eligibleListingIds;

    @CreationTimestamp
    private LocalDateTime createdAt;
}


