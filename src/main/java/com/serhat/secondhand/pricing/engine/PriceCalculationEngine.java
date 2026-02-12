package com.serhat.secondhand.pricing.engine;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.listing.application.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.handler.OfferPriceHandler;
import com.serhat.secondhand.pricing.mapper.PricingMapper;
import com.serhat.secondhand.pricing.util.PricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Stateless pricing calculation engine.
 * Pure computation - no service dependencies, no external calls.
 * All pricing and discount logic centralized here.
 */
@Component
@RequiredArgsConstructor
public class PriceCalculationEngine {

    private final ListingCampaignPricingUtil campaignPricingUtil;
    private final CampaignMapper campaignMapper;
    private final PricingMapper pricingMapper;

    /**
     * Main pricing calculation orchestration.
     * Applies campaigns, coupons, and calculates seller payments.
     */
    public PricingResultDto calculateCartPricing(
            List<Cart> cartItems,
            Map<Long, List<Campaign>> campaignsBySeller,
            Coupon coupon,
            OfferPriceHandler.OfferOverride offerOverride) {

        if (cartItems == null || cartItems.isEmpty()) {
            return pricingMapper.toEmptyResult();
        }

        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal subtotalAfterCampaigns = BigDecimal.ZERO;
        BigDecimal campaignDiscountTotal = BigDecimal.ZERO;

        Map<Long, BigDecimal> sellerSubtotalsAfterCampaign = new HashMap<>();
        List<PricedCartItemDto> pricedItems = new ArrayList<>();

        for (Cart cartItem : cartItems) {
            Listing listing = cartItem.getListing();
            if (listing == null) continue;

            ListingType type = listing.getListingType();
            boolean isOfferLine = OfferPriceHandler.isOfferLine(offerOverride, listing.getId());

            int defaultQuantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
            BigDecimal defaultUnitPrice = PricingUtil.scale(listing.getPrice());

            OfferPriceHandler.OfferPriceResult offerResult = OfferPriceHandler.applyOfferOverride(
                    offerOverride, defaultQuantity, defaultUnitPrice);

            int quantity = offerResult.getQuantity();
            BigDecimal unitPrice = offerResult.getUnitPrice();
            BigDecimal lineOriginal = offerResult.getLineTotal();

            AppliedCampaignDto appliedCampaign = null;
            BigDecimal campaignUnitPrice = unitPrice;

            if (!isOfferLine && type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                List<Campaign> sellerCampaigns = campaignsBySeller.getOrDefault(listing.getSeller().getId(), List.of());
                AppliedCampaignDto best = findBestCampaignForListing(sellerCampaigns, listing);
                if (best != null && best.getDiscountAmount() != null && best.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    appliedCampaign = best;
                    campaignUnitPrice = PricingUtil.scale(unitPrice.subtract(best.getDiscountAmount()));
                    campaignUnitPrice = campaignUnitPrice.max(BigDecimal.ZERO);
                }
            }

            BigDecimal lineAfterCampaign;
            if (isOfferLine && offerOverride != null && offerOverride.getTotalPrice() != null) {
                lineAfterCampaign = PricingUtil.scale(offerOverride.getTotalPrice());
            } else {
                lineAfterCampaign = PricingUtil.scale(campaignUnitPrice.multiply(BigDecimal.valueOf(quantity)));
            }

            BigDecimal lineCampaignDiscount = isOfferLine ? BigDecimal.ZERO : PricingUtil.scale(lineOriginal.subtract(lineAfterCampaign));

            originalSubtotal = originalSubtotal.add(lineOriginal);
            subtotalAfterCampaigns = subtotalAfterCampaigns.add(lineAfterCampaign);
            campaignDiscountTotal = campaignDiscountTotal.add(lineCampaignDiscount);

            Long sellerId = listing.getSeller().getId();
            sellerSubtotalsAfterCampaign.put(sellerId,
                    PricingUtil.scale(sellerSubtotalsAfterCampaign.getOrDefault(sellerId, BigDecimal.ZERO).add(lineAfterCampaign)));

            pricedItems.add(pricingMapper.toPricedCartItemDto(
                    listing, sellerId, type, quantity, unitPrice, campaignUnitPrice, lineAfterCampaign, appliedCampaign));
        }

        BigDecimal couponDiscount = coupon == null ? BigDecimal.ZERO : computeCouponDiscount(coupon, pricedItems);
        BigDecimal total = PricingUtil.scale(subtotalAfterCampaigns.subtract(couponDiscount));
        BigDecimal discountTotal = PricingUtil.scale(campaignDiscountTotal.add(couponDiscount));

        Map<Long, BigDecimal> payableBySeller = allocateDiscountAcrossSellers(sellerSubtotalsAfterCampaign, couponDiscount);

        String normalizedCouponCode = coupon != null ? coupon.getCode() : null;

        return pricingMapper.toResult(
                originalSubtotal,
                subtotalAfterCampaigns,
                campaignDiscountTotal,
                normalizedCouponCode,
                couponDiscount,
                discountTotal,
                total,
                payableBySeller,
                pricedItems
        );
    }

    /**
     * Groups campaigns by seller ID.
     */
    public Map<Long, List<Campaign>> groupCampaignsBySeller(List<Campaign> campaigns) {
        Map<Long, List<Campaign>> map = new HashMap<>();
        for (Campaign c : campaigns) {
            if (c.getSeller() == null) {
                continue;
            }
            Long sellerId = c.getSeller().getId();
            map.computeIfAbsent(sellerId, k -> new ArrayList<>()).add(c);
        }
        return map;
    }

    /**
     * Finds the best campaign (highest discount) for a listing.
     */
    public AppliedCampaignDto findBestCampaignForListing(List<Campaign> campaigns, Listing listing) {
        if (campaigns == null || campaigns.isEmpty() || listing == null) {
            return null;
        }

        BigDecimal unitPrice = PricingUtil.scale(listing.getPrice());
        UUID listingId = listing.getId();
        ListingType type = listing.getListingType();

        BigDecimal bestDiscount = BigDecimal.ZERO;
        Campaign bestCampaign = null;

        for (Campaign c : campaigns) {
            if (!campaignPricingUtil.isApplicable(c, listingId, type)) {
                continue;
            }

            BigDecimal discount = computeCampaignDiscountAmount(c, unitPrice);
            if (discount.compareTo(bestDiscount) > 0) {
                bestDiscount = discount;
                bestCampaign = c;
            }
        }

        if (bestCampaign == null) {
            return null;
        }

        return campaignMapper.toAppliedCampaignDto(bestCampaign, bestDiscount);
    }

    /**
     * Computes campaign discount amount based on discount kind (percent/fixed).
     */
    public BigDecimal computeCampaignDiscountAmount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal pct = campaign.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            return PricingUtil.scale(unitPrice.multiply(pct));
        }
        return PricingUtil.scale(campaign.getValue());
    }

    /**
     * Computes coupon discount based on coupon kind and eligible items.
     */
    public BigDecimal computeCouponDiscount(Coupon coupon, List<PricedCartItemDto> items) {
        if (coupon == null || items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal eligibleSubtotal = calculateEligibleSubtotal(items, coupon);

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

    /**
     * Calculates eligible subtotal for coupon based on coupon scope.
     */
    public BigDecimal calculateEligibleSubtotal(List<PricedCartItemDto> items, Coupon coupon) {
        BigDecimal eligibleSubtotal = BigDecimal.ZERO;
        Set<ListingType> eligibleTypes = coupon.getEligibleTypes();
        boolean typeScoped = coupon.getDiscountKind() == CouponDiscountKind.TYPE_FIXED 
                || coupon.getDiscountKind() == CouponDiscountKind.TYPE_PERCENT;

        for (PricedCartItemDto item : items) {
            if (item.getListingType() == ListingType.REAL_ESTATE || item.getListingType() == ListingType.VEHICLE) {
                continue;
            }
            if (typeScoped && eligibleTypes != null && !eligibleTypes.isEmpty() && !eligibleTypes.contains(item.getListingType())) {
                continue;
            }
            eligibleSubtotal = PricingUtil.scale(eligibleSubtotal.add(item.getLineSubtotal()));
        }

        return eligibleSubtotal;
    }

    /**
     * Allocates coupon discount proportionally across sellers.
     */
    public Map<Long, BigDecimal> allocateDiscountAcrossSellers(
            Map<Long, BigDecimal> sellerSubtotalsAfterCampaign,
            BigDecimal couponDiscount) {

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

    /**
     * Extracts listing types from cart items (excluding REAL_ESTATE and VEHICLE).
     */
    public Set<ListingType> extractCartTypes(List<Cart> cartItems) {
        Set<ListingType> types = new HashSet<>();
        for (Cart item : cartItems) {
            if (item.getListing() != null && item.getListing().getListingType() != null) {
                ListingType type = item.getListing().getListingType();
                if (type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                    types.add(type);
                }
            }
        }
        return types;
    }
}
