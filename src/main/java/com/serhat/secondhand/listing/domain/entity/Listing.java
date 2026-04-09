package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.listing.util.ListingNoGenerator;
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
@Table(name = "listings", indexes = {
    @Index(name = "idx_listing_seller", columnList = "seller_id"),
    @Index(name = "idx_listing_status", columnList = "status"),
    @Index(name = "idx_listing_type", columnList = "listing_type"),
    @Index(name = "idx_listing_location", columnList = "city, district"),
    @Index(name = "idx_listing_created", columnList = "createdAt")
})
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

    @Column(name = "quantity")
    private Integer quantity;

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

    @Version
    private Long version;

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
    
    public void publish() {
        validateCanPublish();
        this.status = ListingStatus.ACTIVE;
    }
    
    public void deactivate() {
        validateCanDeactivate();
        this.status = ListingStatus.INACTIVE;
    }
    
    public void reactivate() {
        validateCanReactivate();
        this.status = ListingStatus.ACTIVE;
    }
    
    public void markAsSold() {
        validateCanMarkAsSold();
        this.status = ListingStatus.SOLD;
    }
    
    public void updatePrice(BigDecimal newPrice) {
        validatePrice(newPrice);
        this.price = newPrice;
    }
    
    public void updateQuantity(Integer newQuantity) {
        validateQuantity(newQuantity);
        this.quantity = newQuantity;
    }
    
    public void markFeeAsPaid() {
        this.isListingFeePaid = true;
    }
    
    public boolean isOwnedBy(Long userId) {
        return this.seller != null && this.seller.getId().equals(userId);
    }
    
    public boolean isEditable() {
        return this.status == ListingStatus.DRAFT || this.status == ListingStatus.ACTIVE;
    }
    
    public boolean canBePublished() {
        return this.status == ListingStatus.DRAFT && this.isListingFeePaid;
    }
    
    private void validateCanPublish() {
        if (this.status != ListingStatus.DRAFT) {
            throw new BusinessException(ListingErrorCodes.INVALID_STATUS_TRANSITION);
        }
        if (!this.isListingFeePaid) {
            throw new BusinessException(ListingErrorCodes.LISTING_FEE_NOT_PAID);
        }
    }
    
    private void validateCanDeactivate() {
        if (this.status != ListingStatus.ACTIVE) {
            throw new BusinessException(ListingErrorCodes.INVALID_STATUS_TRANSITION);
        }
    }
    
    private void validateCanReactivate() {
        if (this.status != ListingStatus.INACTIVE) {
            throw new BusinessException(ListingErrorCodes.INVALID_STATUS_TRANSITION);
        }
    }
    
    private void validateCanMarkAsSold() {
        if (this.status != ListingStatus.ACTIVE && this.status != ListingStatus.RESERVED) {
            throw new BusinessException(ListingErrorCodes.INVALID_STATUS_TRANSITION);
        }
    }
    
    private void validatePrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ListingErrorCodes.INVALID_PRICE);
        }
    }
    
    private void validateQuantity(Integer newQuantity) {
        if (newQuantity != null && newQuantity < 1) {
            throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
        }
    }
}