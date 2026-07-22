package com.serhat.secondhand.shipping.entity;

import com.serhat.secondhand.order.entity.Order;

import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"order"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "shippings")
@EntityListeners(AuditingEntityListener.class)
public class Shipping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ShippingStatus status = ShippingStatus.PENDING;

    @Column(name = "in_transit_at")
    private LocalDateTime inTransitAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "provider_name", length = 50)
    private String providerName;

    @Column(name = "provider_shipment_id", length = 100)
    private String providerShipmentId;

    @Column(name = "label_url", length = 500)
    private String labelUrl;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Column(name = "tracking_url", length = 500)
    private String trackingUrl;

    @Column(name = "shipping_cost")
    private BigDecimal shippingCost;

    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void ship(String providerName, String trackingNumber, String trackingUrl, String providerShipmentId, String labelUrl, BigDecimal shippingCost) {
        this.status = ShippingStatus.IN_TRANSIT;
        this.providerName = providerName;
        this.trackingNumber = trackingNumber;
        this.trackingUrl = trackingUrl;
        this.providerShipmentId = providerShipmentId;
        this.labelUrl = labelUrl;
        this.shippingCost = shippingCost;
        this.inTransitAt = LocalDateTime.now();
        // Default estimation: 3 days from now, provider can update later via webhook
        this.estimatedDeliveryDate = this.inTransitAt.plusDays(3);
    }

    public void markAsDelivered() {
        this.status = ShippingStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
        this.estimatedDeliveryDate = null; // No longer needed
    }

    public void cancel() {
        this.status = ShippingStatus.CANCELLED;
    }
}
