package com.serhat.secondhand.inventory.domain.entity;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.inventory.util.InventoryErrorCodes;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inventory", indexes = {
    @Index(name = "idx_inventory_listing", columnList = "listing_id", unique = true)
})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "listing_id", nullable = false, unique = true)
    private UUID listingId;

    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Version
    private Long version;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void reserveQuantity(int requestedQuantity) {
        validateQuantity(requestedQuantity);
        if (this.availableQuantity != null) {
            if (this.availableQuantity < requestedQuantity) {
                throw new BusinessException(InventoryErrorCodes.INSUFFICIENT_STOCK);
            }
            this.availableQuantity -= requestedQuantity;
        }
    }

    public void restoreQuantity(int restoredQuantity) {
        validateQuantity(restoredQuantity);
        if (this.availableQuantity != null) {
            this.availableQuantity += restoredQuantity;
        }
    }

    public void incrementQuantity(int delta) {
        if (this.availableQuantity != null) {
            this.availableQuantity += delta;
        }
    }

    public void updateQuantity(Integer newQuantity) {
        if (newQuantity != null && newQuantity < 1) {
            throw new BusinessException(InventoryErrorCodes.INVALID_QUANTITY);
        }
        this.availableQuantity = newQuantity;
    }

    private void validateQuantity(int quantity) {
        if (quantity < 1) {
            throw new BusinessException(InventoryErrorCodes.INVALID_QUANTITY);
        }
    }
}
