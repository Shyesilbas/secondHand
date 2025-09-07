package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "price_history")
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "new_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal newPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(name = "change_date", nullable = false)
    @Builder.Default
    private LocalDateTime changeDate = LocalDateTime.now();

    @Column(name = "change_reason")
    private String changeReason;

    @Column(name = "percentage_change", precision = 5, scale = 2)
    private BigDecimal percentageChange;

    @PrePersist
    private void calculatePercentageChange() {
        if (oldPrice != null && oldPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal difference = newPrice.subtract(oldPrice);
            this.percentageChange = difference.divide(oldPrice, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }
}
