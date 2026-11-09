package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "price_history")
public class PriceHistory {

    private static final BigDecimal MAX_PERCENTAGE_CHANGE = new BigDecimal("99999999.99");
    private static final BigDecimal MIN_PERCENTAGE_CHANGE = MAX_PERCENTAGE_CHANGE.negate();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "old_price", precision = 15, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "new_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal newPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(name = "change_date", nullable = false)
    @Builder.Default
    private LocalDateTime changeDate = LocalDateTime.now();

    @Column(name = "change_reason")
    private String changeReason;

    @Column(name = "percentage_change", precision = 10, scale = 2)
    private BigDecimal percentageChange;

    @PrePersist
    void calculatePercentageChange() {
        if (oldPrice != null && oldPrice.compareTo(BigDecimal.ZERO) > 0 && newPrice != null) {
            BigDecimal difference = newPrice.subtract(oldPrice);
            BigDecimal rawPct = difference.divide(oldPrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
            if (rawPct.compareTo(MAX_PERCENTAGE_CHANGE) > 0) {
                this.percentageChange = MAX_PERCENTAGE_CHANGE;
            } else if (rawPct.compareTo(MIN_PERCENTAGE_CHANGE) < 0) {
                this.percentageChange = MIN_PERCENTAGE_CHANGE;
            } else {
                this.percentageChange = rawPct;
            }
        }
    }
}
