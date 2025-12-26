package com.serhat.secondhand.pricing.calculator;

import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.util.PricingUtil;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class CouponDiscountCalculator {

    public BigDecimal computeCouponDiscount(Coupon coupon, List<PricedCartItemDto> items) {
        if (coupon == null || items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal eligibleSubtotal = BigDecimal.ZERO;
        Set<ListingType> eligibleTypes = coupon.getEligibleTypes();
        boolean typeScoped = coupon.getDiscountKind() == CouponDiscountKind.TYPE_FIXED || coupon.getDiscountKind() == CouponDiscountKind.TYPE_PERCENT;

        for (PricedCartItemDto item : items) {
            if (item.getListingType() == ListingType.REAL_ESTATE || item.getListingType() == ListingType.VEHICLE) {
                continue;
            }
            if (typeScoped && eligibleTypes != null && !eligibleTypes.isEmpty() && !eligibleTypes.contains(item.getListingType())) {
                continue;
            }
            eligibleSubtotal = PricingUtil.scale(eligibleSubtotal.add(item.getLineSubtotal()));
        }

        if (eligibleSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if ((coupon.getDiscountKind() == CouponDiscountKind.THRESHOLD_FIXED || coupon.getDiscountKind() == CouponDiscountKind.THRESHOLD_PERCENT)
                && coupon.getMinSubtotal() != null
                && eligibleSubtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        switch (coupon.getDiscountKind()) {
            case ORDER_PERCENT, TYPE_PERCENT, THRESHOLD_PERCENT -> {
                BigDecimal pct = coupon.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
                discount = PricingUtil.scale(eligibleSubtotal.multiply(pct));
            }
            case ORDER_FIXED, TYPE_FIXED, THRESHOLD_FIXED -> discount = PricingUtil.scale(coupon.getValue());
            default -> discount = BigDecimal.ZERO;
        }

        if (discount.compareTo(eligibleSubtotal) > 0) {
            discount = eligibleSubtotal;
        }
        if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
            discount = PricingUtil.scale(coupon.getMaxDiscount());
        }
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return PricingUtil.scale(discount);
    }

    public Map<Long, BigDecimal> allocateCouponAcrossSellers(Map<Long, BigDecimal> sellerSubtotalsAfterCampaign, BigDecimal couponDiscount) {
        Map<Long, BigDecimal> payable = new HashMap<>();
        if (sellerSubtotalsAfterCampaign == null || sellerSubtotalsAfterCampaign.isEmpty()) {
            return payable;
        }

        BigDecimal totalSubtotal = sellerSubtotalsAfterCampaign.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalSubtotal = PricingUtil.scale(totalSubtotal);

        if (couponDiscount == null || couponDiscount.compareTo(BigDecimal.ZERO) <= 0 || totalSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            for (var e : sellerSubtotalsAfterCampaign.entrySet()) {
                payable.put(e.getKey(), PricingUtil.scale(e.getValue()));
            }
            return payable;
        }

        List<Long> sellerIds = new ArrayList<>(sellerSubtotalsAfterCampaign.keySet());
        sellerIds.sort(Long::compareTo);

        BigDecimal remaining = PricingUtil.scale(couponDiscount);
        for (int i = 0; i < sellerIds.size(); i++) {
            Long sellerId = sellerIds.get(i);
            BigDecimal sellerSubtotal = PricingUtil.scale(sellerSubtotalsAfterCampaign.getOrDefault(sellerId, BigDecimal.ZERO));
            BigDecimal share;
            if (i == sellerIds.size() - 1) {
                share = remaining;
            } else {
                share = PricingUtil.scale(couponDiscount.multiply(sellerSubtotal).divide(totalSubtotal, 2, RoundingMode.HALF_UP));
                if (share.compareTo(remaining) > 0) {
                    share = remaining;
                }
            }
            remaining = PricingUtil.scale(remaining.subtract(share));
            BigDecimal sellerPayable = PricingUtil.scale(sellerSubtotal.subtract(share));
            if (sellerPayable.compareTo(BigDecimal.ZERO) < 0) {
                sellerPayable = BigDecimal.ZERO;
            }
            payable.put(sellerId, sellerPayable);
        }

        return payable;
    }
}

