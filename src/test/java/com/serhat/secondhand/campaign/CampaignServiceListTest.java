package com.serhat.secondhand.campaign;

import com.serhat.secondhand.campaign.application.CampaignService;
import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.campaign.repository.CampaignRepository;
import com.serhat.secondhand.campaign.repository.projection.CampaignEligibleListingProjection;
import com.serhat.secondhand.campaign.repository.projection.CampaignEligibleTypeProjection;
import com.serhat.secondhand.campaign.repository.projection.CampaignListProjection;
import com.serhat.secondhand.campaign.validator.CampaignValidator;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** The seller's campaign list must carry the scope and bundle condition the campaign card renders. */
class CampaignServiceListTest {

    private final CampaignRepository repository = mock(CampaignRepository.class);
    private final CampaignService service = new CampaignService(
            repository, mock(IUserService.class), mock(CampaignValidator.class), new CampaignMapper());

    @Test
    void listMyCampaigns_hydratesScopeAndMinQuantityFromBatchQueries() {
        UUID campaignId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        CampaignListProjection row = mock(CampaignListProjection.class);
        when(row.getId()).thenReturn(campaignId);
        when(row.getName()).thenReturn("Bundle");
        when(row.isActive()).thenReturn(true);
        when(row.getMinQuantity()).thenReturn(3);
        when(repository.findPageSummaryBySellerId(eq(7L), any()))
                .thenReturn(new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1));

        CampaignEligibleTypeProjection typeRow = mock(CampaignEligibleTypeProjection.class);
        when(typeRow.getCampaignId()).thenReturn(campaignId);
        when(typeRow.getListingType()).thenReturn(ListingType.ELECTRONICS);
        when(repository.findEligibleTypesByCampaignIds(List.of(campaignId))).thenReturn(List.of(typeRow));

        CampaignEligibleListingProjection listingRow = mock(CampaignEligibleListingProjection.class);
        when(listingRow.getCampaignId()).thenReturn(campaignId);
        when(listingRow.getListingId()).thenReturn(listingId);
        when(repository.findEligibleListingIdsByCampaignIds(List.of(campaignId))).thenReturn(List.of(listingRow));

        Page<CampaignDto> page = service.listMyCampaigns(7L, PageRequest.of(0, 20));

        CampaignDto dto = page.getContent().get(0);
        assertThat(dto.getMinQuantity()).isEqualTo(3);
        assertThat(dto.getEligibleTypes()).containsExactly(ListingType.ELECTRONICS);
        assertThat(dto.getEligibleListingIds()).containsExactly(listingId);
    }
}
