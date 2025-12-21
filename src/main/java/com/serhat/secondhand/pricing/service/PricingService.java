package com.serhat.secondhand.pricing.service;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.campaign.service.CampaignService;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.cart.entity.Cart;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PricingService {

    private final CampaignService campaignService;
    private final CouponService couponService;

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode) {
        return priceCartInternal(buyer, cartItems, couponCode, null);
    }

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode, UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice) {
        if (offerListingId == null) {
            return priceCartInternal(buyer, cartItems, couponCode, null);
        }
        OfferOverride override = OfferOverride.builder()
                .listingId(offerListingId)
                .quantity(offerQuantity)
                .totalPrice(offerTotalPrice)
                .build();
        return priceCartInternal(buyer, cartItems, couponCode, override);
    }

    private PricingResultDto priceCartInternal(User buyer, List<Cart> cartItems, String couponCode, OfferOverride offerOverride) {
        if (cartItems == null || cartItems.isEmpty()) {
            return PricingResultDto.builder()
                    .originalSubtotal(BigDecimal.ZERO)
                    .subtotalAfterCampaigns(BigDecimal.ZERO)
                    .campaignDiscount(BigDecimal.ZERO)
                    .couponCode(null)
                    .couponDiscount(BigDecimal.ZERO)
                    .discountTotal(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .payableBySeller(Map.of())
                    .items(List.of())
                    .build();
        }

        List<Long> sellerIds = cartItems.stream()
                .map(ci -> ci.getListing().getSeller().getId())
                .distinct()
                .toList();

        List<Campaign> activeCampaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<Campaign>> campaignsBySeller = groupCampaignsBySeller(activeCampaigns);

        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal subtotalAfterCampaigns = BigDecimal.ZERO;
        BigDecimal campaignDiscountTotal = BigDecimal.ZERO;

        Map<Long, BigDecimal> sellerSubtotalsAfterCampaign = new HashMap<>();
        List<PricedCartItemDto> pricedItems = new ArrayList<>();
        Set<ListingType> cartTypes = new HashSet<>();

        for (Cart cartItem : cartItems) {
            Listing listing = cartItem.getListing();
            if (listing == null) {
                continue;
            }

            ListingType type = listing.getListingType();
            if (type != null && type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                cartTypes.add(type);
            }

            boolean isOfferLine = offerOverride != null
                    && offerOverride.getListingId() != null
                    && offerOverride.getListingId().equals(listing.getId());

            int quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
            BigDecimal unitPrice = scale(listing.getPrice());
            BigDecimal lineOriginal = scale(unitPrice.multiply(BigDecimal.valueOf(quantity)));

            if (isOfferLine) {
                int oq = offerOverride.getQuantity() != null && offerOverride.getQuantity() > 0 ? offerOverride.getQuantity() : quantity;
                BigDecimal ot = offerOverride.getTotalPrice() != null ? scale(offerOverride.getTotalPrice()) : null;
                if (ot != null) {
                    quantity = oq;
                    unitPrice = scale(ot.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP));
                    lineOriginal = ot;
                }
            }

            AppliedCampaignDto appliedCampaign = null;
            BigDecimal campaignUnitPrice = unitPrice;

            if (!isOfferLine && type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                List<Campaign> sellerCampaigns = campaignsBySeller.getOrDefault(listing.getSeller().getId(), List.of());
                AppliedCampaignDto best = findBestCampaignForListing(sellerCampaigns, listing);
                if (best != null && best.getDiscountAmount() != null && best.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    appliedCampaign = best;
                    campaignUnitPrice = scale(unitPrice.subtract(best.getDiscountAmount()));
                    if (campaignUnitPrice.compareTo(BigDecimal.ZERO) < 0) {
                        campaignUnitPrice = BigDecimal.ZERO;
                    }
                }
            }

            BigDecimal lineAfterCampaign;
            if (isOfferLine && offerOverride != null && offerOverride.getTotalPrice() != null) {
                lineAfterCampaign = scale(offerOverride.getTotalPrice());
            } else {
                lineAfterCampaign = scale(campaignUnitPrice.multiply(BigDecimal.valueOf(quantity)));
            }
            BigDecimal lineCampaignDiscount = isOfferLine ? BigDecimal.ZERO : scale(lineOriginal.subtract(lineAfterCampaign));

            originalSubtotal = scale(originalSubtotal.add(lineOriginal));
            subtotalAfterCampaigns = scale(subtotalAfterCampaigns.add(lineAfterCampaign));
            campaignDiscountTotal = scale(campaignDiscountTotal.add(lineCampaignDiscount));

            Long sellerId = listing.getSeller().getId();
            sellerSubtotalsAfterCampaign.put(sellerId, scale(sellerSubtotalsAfterCampaign.getOrDefault(sellerId, BigDecimal.ZERO).add(lineAfterCampaign)));

            pricedItems.add(PricedCartItemDto.builder()
                    .listingId(listing.getId())
                    .sellerId(sellerId)
                    .listingType(type)
                    .quantity(quantity)
                    .originalUnitPrice(unitPrice)
                    .campaignUnitPrice(campaignUnitPrice)
                    .lineSubtotal(lineAfterCampaign)
                    .appliedCampaign(appliedCampaign)
                    .build());
        }

        BigDecimal couponEligibleSubtotal = subtotalAfterCampaigns;
        Coupon coupon = null;
        String normalizedCouponCode = couponCode != null && !couponCode.isBlank() ? couponCode.trim().toUpperCase() : null;
        if (normalizedCouponCode != null) {
            coupon = couponService.getValidCouponOrThrow(normalizedCouponCode, buyer, cartTypes, couponEligibleSubtotal);
        }

        BigDecimal couponDiscount = coupon == null ? BigDecimal.ZERO : computeCouponDiscount(coupon, pricedItems);
        BigDecimal total = scale(subtotalAfterCampaigns.subtract(couponDiscount));
        BigDecimal discountTotal = scale(campaignDiscountTotal.add(couponDiscount));

        Map<Long, BigDecimal> payableBySeller = allocateCouponAcrossSellers(sellerSubtotalsAfterCampaign, couponDiscount);

        return PricingResultDto.builder()
                .originalSubtotal(originalSubtotal)
                .subtotalAfterCampaigns(subtotalAfterCampaigns)
                .campaignDiscount(campaignDiscountTotal)
                .couponCode(normalizedCouponCode)
                .couponDiscount(couponDiscount)
                .discountTotal(discountTotal)
                .total(total)
                .payableBySeller(payableBySeller)
                .items(pricedItems)
                .build();
    }

    private Map<Long, List<Campaign>> groupCampaignsBySeller(List<Campaign> campaigns) {
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

    private AppliedCampaignDto findBestCampaignForListing(List<Campaign> campaigns, Listing listing) {
        if (campaigns == null || campaigns.isEmpty() || listing == null) {
            return null;
        }

        BigDecimal unitPrice = scale(listing.getPrice());
        UUID listingId = listing.getId();
        ListingType type = listing.getListingType();

        BigDecimal bestDiscount = BigDecimal.ZERO;
        Campaign bestCampaign = null;

        for (Campaign c : campaigns) {
            if (!isCampaignApplicable(c, listingId, type)) {
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

        return AppliedCampaignDto.builder()
                .campaignId(bestCampaign.getId())
                .name(bestCampaign.getName())
                .discountKind(bestCampaign.getDiscountKind())
                .value(bestCampaign.getValue())
                .discountAmount(bestDiscount)
                .build();
    }

    private boolean isCampaignApplicable(Campaign campaign, UUID listingId, ListingType type) {
        if (campaign == null || !campaign.isActive()) {
            return false;
        }
        if (type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE) {
            return false;
        }

        boolean hasListingFilter = campaign.getEligibleListingIds() != null && !campaign.getEligibleListingIds().isEmpty();
        boolean hasTypeFilter = campaign.getEligibleTypes() != null && !campaign.getEligibleTypes().isEmpty();

        if (hasListingFilter && campaign.getEligibleListingIds().contains(listingId)) {
            return true;
        }
        if (hasTypeFilter && campaign.getEligibleTypes().contains(type)) {
            return true;
        }
        return !hasListingFilter && !hasTypeFilter;
    }

    private BigDecimal computeCampaignDiscountAmount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal pct = campaign.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            return scale(unitPrice.multiply(pct));
        }
        return scale(campaign.getValue());
    }

    private BigDecimal computeCouponDiscount(Coupon coupon, List<PricedCartItemDto> items) {
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
            eligibleSubtotal = scale(eligibleSubtotal.add(item.getLineSubtotal()));
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
                discount = scale(eligibleSubtotal.multiply(pct));
            }
            case ORDER_FIXED, TYPE_FIXED, THRESHOLD_FIXED -> discount = scale(coupon.getValue());
            default -> discount = BigDecimal.ZERO;
        }

        if (discount.compareTo(eligibleSubtotal) > 0) {
            discount = eligibleSubtotal;
        }
        if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
            discount = scale(coupon.getMaxDiscount());
        }
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return scale(discount);
    }

    private Map<Long, BigDecimal> allocateCouponAcrossSellers(Map<Long, BigDecimal> sellerSubtotalsAfterCampaign, BigDecimal couponDiscount) {
        Map<Long, BigDecimal> payable = new HashMap<>();
        if (sellerSubtotalsAfterCampaign == null || sellerSubtotalsAfterCampaign.isEmpty()) {
            return payable;
        }

        BigDecimal totalSubtotal = sellerSubtotalsAfterCampaign.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalSubtotal = scale(totalSubtotal);

        if (couponDiscount == null || couponDiscount.compareTo(BigDecimal.ZERO) <= 0 || totalSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            for (var e : sellerSubtotalsAfterCampaign.entrySet()) {
                payable.put(e.getKey(), scale(e.getValue()));
            }
            return payable;
        }

        List<Long> sellerIds = new ArrayList<>(sellerSubtotalsAfterCampaign.keySet());
        sellerIds.sort(Long::compareTo);

        BigDecimal remaining = scale(couponDiscount);
        for (int i = 0; i < sellerIds.size(); i++) {
            Long sellerId = sellerIds.get(i);
            BigDecimal sellerSubtotal = scale(sellerSubtotalsAfterCampaign.getOrDefault(sellerId, BigDecimal.ZERO));
            BigDecimal share;
            if (i == sellerIds.size() - 1) {
                share = remaining;
            } else {
                share = scale(couponDiscount.multiply(sellerSubtotal).divide(totalSubtotal, 2, RoundingMode.HALF_UP));
                if (share.compareTo(remaining) > 0) {
                    share = remaining;
                }
            }
            remaining = scale(remaining.subtract(share));
            BigDecimal sellerPayable = scale(sellerSubtotal.subtract(share));
            if (sellerPayable.compareTo(BigDecimal.ZERO) < 0) {
                sellerPayable = BigDecimal.ZERO;
            }
            payable.put(sellerId, sellerPayable);
        }

        return payable;
    }

    private BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    @lombok.Data
    @lombok.Builder
    private static class OfferOverride {
        private UUID listingId;
        private Integer quantity;
        private BigDecimal totalPrice;
    }
}


