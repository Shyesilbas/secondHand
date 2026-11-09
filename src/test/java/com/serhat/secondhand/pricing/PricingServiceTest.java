package com.serhat.secondhand.pricing;

import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.pricing.application.PricingService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.engine.PriceCalculationEngine;
import com.serhat.secondhand.pricing.mapper.PricingMapper;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PricingServiceTest {

    private final ICampaignService campaignService = mock(ICampaignService.class);
    private final CouponRepository couponRepository = mock(CouponRepository.class);
    private final CouponValidator couponValidator = mock(CouponValidator.class);
    private final PricingService pricingService = new PricingService(
            campaignService,
            couponRepository,
            couponValidator,
            new PriceCalculationEngine(new ListingCampaignPricingUtil(campaignService), new CampaignMapper(), new PricingMapper()),
            new PricingMapper());

    private final User buyer = User.builder().id(2L).build();
    private final User seller = User.builder().id(1L).build();
    private final List<Cart> cart = List.of(cartLine("200.00", 1));

    @Test
    void unknownCouponFailsCheckoutButPreviewDropsIt() {
        when(couponRepository.findByCodeIgnoreCase(anyString())).thenReturn(Optional.empty());

        Result<PricingResultDto> checkout = pricingService.priceCartForCheckout(buyer, cart, "nope", null, null, null);
        assertTrue(checkout.isError());
        assertEquals(CouponErrorCodes.COUPON_NOT_FOUND.getCode(), checkout.getErrorCode());

        PricingResultDto preview = pricingService.priceCart(buyer, cart, "nope");
        assertNull(preview.getCouponCode());
        assertEquals(new BigDecimal("200.00"), preview.getTotal());
    }

    @Test
    void rejectedCouponReturnsValidatorErrorCode() {
        Coupon coupon = coupon("10");
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponValidator.validateCouponForCart(any(), any(), any(), any()))
                .thenReturn(Result.error(CouponErrorCodes.COUPON_EXPIRED));

        Result<PricingResultDto> checkout = pricingService.priceCartForCheckout(buyer, cart, "save10", null, null, null);

        assertTrue(checkout.isError());
        assertEquals(CouponErrorCodes.COUPON_EXPIRED.getCode(), checkout.getErrorCode());
    }

    @Test
    void validCouponIsAppliedAtCheckout() {
        Coupon coupon = coupon("10");
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponValidator.validateCouponForCart(any(), any(), any(), any())).thenReturn(Result.success());

        Result<PricingResultDto> checkout = pricingService.priceCartForCheckout(buyer, cart, "save10", null, null, null);

        assertTrue(checkout.isSuccess());
        assertEquals("SAVE10", checkout.getData().getCouponCode());
        assertEquals(new BigDecimal("180.00"), checkout.getData().getTotal());
    }

    @Test
    void noCouponIsNotAnError() {
        Result<PricingResultDto> checkout = pricingService.priceCartForCheckout(buyer, cart, "  ", null, null, null);

        assertTrue(checkout.isSuccess());
        assertEquals(new BigDecimal("200.00"), checkout.getData().getTotal());
    }

    private Coupon coupon(String percent) {
        return Coupon.builder()
                .code("SAVE10")
                .active(true)
                .discountKind(CouponDiscountKind.ORDER_PERCENT)
                .value(new BigDecimal(percent))
                .build();
    }

    private Cart cartLine(String price, int quantity) {
        SportsListing listing = SportsListing.builder()
                .id(UUID.randomUUID())
                .price(new BigDecimal(price))
                .listingType(ListingType.SPORTS)
                .seller(seller)
                .build();
        return Cart.builder().listing(listing).quantity(quantity).build();
    }
}
