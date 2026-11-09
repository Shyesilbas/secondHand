package com.serhat.secondhand.pricing;

import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.engine.PriceCalculationEngine;
import com.serhat.secondhand.pricing.handler.OfferPriceHandler;
import com.serhat.secondhand.pricing.mapper.PricingMapper;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class PriceCalculationEngineTest {

    private final PriceCalculationEngine engine = new PriceCalculationEngine(
            new ListingCampaignPricingUtil(mock(ICampaignService.class)),
            new CampaignMapper(),
            new PricingMapper());

    private final User seller = User.builder().id(1L).build();

    @Test
    void offerPriceAppliesOnlyToTheOfferListingLine() {
        Cart offerLine = cartLine("1000.00", 1);
        Cart regularLine = cartLine("1000.00", 2);
        OfferPriceHandler.OfferOverride offer = OfferPriceHandler.OfferOverride.builder()
                .listingId(offerLine.getListing().getId())
                .quantity(1)
                .totalPrice(new BigDecimal("500.00"))
                .build();

        PricingResultDto result = engine.calculateCartPricing(
                List.of(regularLine, offerLine), Map.of(), null, offer);

        PricedCartItemDto regular = line(result, regularLine);
        assertEquals(2, regular.getQuantity());
        assertEquals(new BigDecimal("1000.00"), regular.getOriginalUnitPrice());
        assertEquals(new BigDecimal("2000.00"), regular.getLineSubtotal());

        PricedCartItemDto offered = line(result, offerLine);
        assertEquals(1, offered.getQuantity());
        assertEquals(new BigDecimal("500.00"), offered.getLineSubtotal());

        assertEquals(new BigDecimal("2500.00"), result.getTotal());
        assertEquals(new BigDecimal("2500.00"), result.getPayableBySeller().get(seller.getId()));
    }

    @Test
    void withoutOfferEveryLineUsesListingPrice() {
        Cart a = cartLine("100.00", 3);
        Cart b = cartLine("250.00", 1);

        PricingResultDto result = engine.calculateCartPricing(List.of(a, b), Map.of(), null, null);

        assertEquals(new BigDecimal("300.00"), line(result, a).getLineSubtotal());
        assertEquals(new BigDecimal("250.00"), line(result, b).getLineSubtotal());
        assertEquals(new BigDecimal("550.00"), result.getTotal());
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

    private PricedCartItemDto line(PricingResultDto result, Cart cart) {
        return result.getItems().stream()
                .filter(item -> item.getListingId().equals(cart.getListing().getId()))
                .findFirst()
                .orElseThrow();
    }
}
