package com.serhat.secondhand.shipping.entity;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "carrier")
    private Carrier carrier;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void ship(Carrier carrier, String trackingNumber) {
        this.status = ShippingStatus.IN_TRANSIT;
        this.carrier = carrier;
        this.trackingNumber = trackingNumber;
        this.inTransitAt = LocalDateTime.now();
        // Default estimation: 3 days from now
        this.estimatedDeliveryDate = this.inTransitAt.plusDays(3);
    }

    public void markAsDelivered() {
        this.status = ShippingStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
        this.estimatedDeliveryDate = null; // No longer needed
    }

    public void cancel() {
        this.status = ShippingStatus.CANCELLED;
        this.trackingNumber = null;
        this.carrier = null;
    }

    public String getTrackingUrl() {
        if (carrier == null || carrier == Carrier.OTHER || trackingNumber == null || trackingNumber.isBlank()) {
            return null;
        }
        return carrier.getTrackingUrlBase() + trackingNumber;
    }
}
