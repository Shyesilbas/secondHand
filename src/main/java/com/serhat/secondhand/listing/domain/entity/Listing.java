package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.util.ListingNoGenerator;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "listings")
@Inheritance(strategy = InheritanceType.JOINED)
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "listing_no", unique = true, nullable = false, length = 8)
    private String listingNo;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    private ListingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false)
    private ListingType listingType;

    @Column(name = "is_listing_fee_paid", nullable = false)
    @Builder.Default
    private boolean isListingFeePaid = false;

    private String city;
    private String district;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User seller;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { 
        createdAt = updatedAt = LocalDateTime.now();
        if (listingNo == null) {
            listingNo = ListingNoGenerator.generate();
        }
    }
    
    @PreUpdate
    void onUpdate() { 
        updatedAt = LocalDateTime.now(); 
    }
}