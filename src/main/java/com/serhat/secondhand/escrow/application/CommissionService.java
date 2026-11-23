package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.core.config.PlatformFeeConfig;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;

/**
 * Seller commission on sales. Vehicle and real estate pay a listing creation fee instead, and orders
 * created before {@code app.platform.commission.effective-from} pay nothing. The band is picked per order
 * line from the seller gross (buyer-paid amount plus the platform coupon share).
 */
@Service
@RequiredArgsConstructor
public class CommissionService {

    private static final BigDecimal PERCENT_DIVISOR = BigDecimal.valueOf(100);

    private final PlatformFeeConfig platformFeeConfig;

    public record Commission(BigDecimal amount, BigDecimal ratePercent) {
        public static final Commission NONE = new Commission(BigDecimal.ZERO.setScale(2), null);
    }

    public Commission quote(OrderItem item, Order order, BigDecimal sellerGross) {
        ListingType type = item.getListingType() != null ? item.getListingType()
                : item.getListing() != null ? item.getListing().getListingType() : null;
        LocalDateTime orderedAt = order != null ? order.getCreatedAt() : null;
        return quote(type, orderedAt, sellerGross);
    }

    public Commission quote(ListingType type, LocalDateTime orderedAt, BigDecimal sellerGross) {
        if (type != null && type.chargesCreationFee()) {
            return Commission.NONE;
        }
        PlatformFeeConfig.Commission config = platformFeeConfig.getCommission();
        LocalDateTime effectiveFrom = config.getEffectiveFrom();
        if (orderedAt == null || orderedAt.isBefore(effectiveFrom)) {
            return Commission.NONE;
        }
        if (sellerGross == null || sellerGross.signum() <= 0) {
            return Commission.NONE;
        }
        BigDecimal rate = rateFor(sellerGross);
        BigDecimal amount = sellerGross.multiply(rate).divide(PERCENT_DIVISOR, 2, RoundingMode.HALF_UP);
        return new Commission(amount, rate);
    }

    /** The highest band whose minimum the amount reaches. */
    public BigDecimal rateFor(BigDecimal sellerGross) {
        return platformFeeConfig.getCommission().getBands().stream()
                .sorted(Comparator.comparing(PlatformFeeConfig.Band::getMinAmount))
                .filter(band -> sellerGross.compareTo(band.getMinAmount()) >= 0)
                .reduce((first, second) -> second)
                .map(PlatformFeeConfig.Band::getRatePercent)
                .orElseThrow(() -> new IllegalStateException("No commission band covers " + sellerGross));
    }
}
