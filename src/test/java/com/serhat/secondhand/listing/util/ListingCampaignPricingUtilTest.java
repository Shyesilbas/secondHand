package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class ListingCampaignPricingUtilTest {

    private static final UUID PICKED = UUID.randomUUID();
    private static final UUID OTHER = UUID.randomUUID();

    @Mock
    private ICampaignService campaignService;

    private ListingCampaignPricingUtil util;

    @BeforeEach
    void setUp() {
        util = new ListingCampaignPricingUtil(campaignService);
    }

    private Campaign campaign(Set<UUID> listingIds, Set<ListingType> types, boolean applyToFuture) {
        return Campaign.builder()
                .active(true)
                .startsAt(LocalDateTime.now().minusHours(1))
                .endsAt(LocalDateTime.now().plusDays(1))
                .discountKind(CampaignDiscountKind.PERCENT)
                .value(BigDecimal.TEN)
                .eligibleListingIds(listingIds)
                .eligibleTypes(types)
                .applyToFutureListings(applyToFuture)
                .build();
    }

    @Test
    void pickedListingsCampaignWithFutureFlagStaysOnPickedListings() {
        Campaign c = campaign(Set.of(PICKED), Set.of(), true);

        assertTrue(util.isApplicable(c, PICKED, ListingType.BOOKS));
        assertFalse(util.isApplicable(c, OTHER, ListingType.BOOKS));
    }

    @Test
    void pickedListingsCampaignWithoutFutureFlagStaysOnPickedListings() {
        Campaign c = campaign(Set.of(PICKED), Set.of(), false);

        assertTrue(util.isApplicable(c, PICKED, ListingType.BOOKS));
        assertFalse(util.isApplicable(c, OTHER, ListingType.BOOKS));
    }

    @Test
    void typeCampaignCoversAnyListingOfThatTypeOnly() {
        Campaign c = campaign(Set.of(), Set.of(ListingType.BOOKS), true);

        assertTrue(util.isApplicable(c, OTHER, ListingType.BOOKS));
        assertFalse(util.isApplicable(c, OTHER, ListingType.CLOTHING));
    }

    @Test
    void campaignWithoutFiltersCoversAllCampaignableListings() {
        Campaign c = campaign(Set.of(), Set.of(), false);

        assertTrue(util.isApplicable(c, OTHER, ListingType.SPORTS));
        assertFalse(util.isApplicable(c, OTHER, ListingType.VEHICLE));
    }

    @Test
    void notStartedCampaignDoesNotApply() {
        Campaign c = campaign(Set.of(), Set.of(), false);
        c.setStartsAt(LocalDateTime.now().plusMinutes(5));

        assertFalse(util.isApplicable(c, OTHER, ListingType.BOOKS));
    }
}
