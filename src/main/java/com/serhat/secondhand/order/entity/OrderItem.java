package com.serhat.secondhand.order.entity;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(exclude = {"order", "listing"})
@ToString(exclude = {"order", "listing"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_listing", columnList = "listing_id"),
        @Index(name = "idx_order_item_seller", columnList = "seller_id")
})
@EntityListeners(AuditingEntityListener.class)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, referencedColumnName = "id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type")
    private ListingType listingType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "TRY";

    @Column(name = "notes", length = 500)
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
