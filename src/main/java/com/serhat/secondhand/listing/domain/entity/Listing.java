package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
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
@DiscriminatorColumn(name = "listing_type", length = 32)
public abstract class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    private ListingStatus status;

    @Column(name = "is_listing_fee_paid", nullable = false)
    @Builder.Default
    private boolean isListingFeePaid = false;

    private String city;
    private String district;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User seller;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}