package com.serhat.secondhand.coupon.entity;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private boolean active;

    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponDiscountKind discountKind;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal value;

    @Column(precision = 19, scale = 2)
    private BigDecimal minSubtotal;

    @Column(precision = 19, scale = 2)
    private BigDecimal maxDiscount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "coupon_eligible_types", joinColumns = @JoinColumn(name = "coupon_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false)
    private Set<ListingType> eligibleTypes;

    private Integer usageLimitGlobal;
    private Integer usageLimitPerUser;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

