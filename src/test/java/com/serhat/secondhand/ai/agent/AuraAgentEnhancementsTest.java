package com.serhat.secondhand.ai.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.agent.query.AgentContextSection;
import com.serhat.secondhand.ai.agent.query.ListingFocusAgentContextAdapter;
import com.serhat.secondhand.ai.agent.search.AgentSearchAugmentation;
import com.serhat.secondhand.ai.agent.search.AuraAgentSearchRateLimiter;
import com.serhat.secondhand.ai.agent.search.AuraListingSearchOrchestrator;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.FuelType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.GearType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuraAgentEnhancementsTest {

    private final ListingQueryService listingQueryService = mock(ListingQueryService.class);
    private final ListingSearchService listingSearchService = mock(ListingSearchService.class);
    private final GeminiClient geminiClient = mock(GeminiClient.class);
    private final AuraAgentSearchRateLimiter rateLimiter = mock(AuraAgentSearchRateLimiter.class);

    private ListingFocusAgentContextAdapter focusAdapter;
    private AuraListingSearchOrchestrator searchOrchestrator;

    @BeforeEach
    void setUp() {
        focusAdapter = new ListingFocusAgentContextAdapter(listingQueryService, listingSearchService);
        searchOrchestrator = new AuraListingSearchOrchestrator(
                geminiClient,
                new ObjectMapper(),
                listingSearchService,
                rateLimiter
        );
        ReflectionTestUtils.setField(searchOrchestrator, "searchEnabled", true);
        when(rateLimiter.tryAcquire(anyLong())).thenReturn(true);
    }

    @Test
    void listingFocusAdapter_summarizesVehicleAndRealEstateAndComputesRealMarketPriceBenchmark() {
        UUID listingId = UUID.randomUUID();
        VehicleListingDto vehicle = new VehicleListingDto();
        vehicle.setId(listingId);
        vehicle.setListingNo("VH-1001");
        vehicle.setTitle("2021 BMW 320i M Sport");
        vehicle.setType(ListingType.VEHICLE);
        vehicle.setStatus(ListingStatus.ACTIVE);
        vehicle.setPrice(new BigDecimal("1800000"));
        vehicle.setCurrency(Currency.TRY);
        vehicle.setCity("İstanbul");
        vehicle.setDistrict("Kadıköy");
        vehicle.setBrand(new LookupDto(UUID.randomUUID(), "BMW", "BMW"));
        vehicle.setModel(new ModelDto(UUID.randomUUID(), "320i", null, null));
        vehicle.setYear(2021);
        vehicle.setMileage(45000);
        vehicle.setFuelType(FuelType.GASOLINE);
        vehicle.setGearbox(GearType.AUTOMATIC);
        vehicle.setHorsePower(170);
        vehicle.setAccidentHistory(false);
        vehicle.setAttributes(Map.of("tramerAmount", 0));

        VehicleListingDto peer1 = new VehicleListingDto();
        peer1.setPrice(new BigDecimal("2000000"));
        VehicleListingDto peer2 = new VehicleListingDto();
        peer2.setPrice(new BigDecimal("2200000"));

        when(listingQueryService.findByIdAsDto(listingId, 5L, 5L)).thenReturn(Optional.of(vehicle));
        when(listingSearchService.filterByCategory(any(), eq(5L)))
                .thenReturn(new PageImpl<>(List.of(vehicle, peer1, peer2)));

        AgentContextSection section = focusAdapter.fetch(
                5L,
                new AgentUiContextRequest("listing_detail", "/listings/" + listingId, listingId.toString(), null)
        );

        assertThat(section.status()).isEqualTo("ok");
        assertThat(section.summary())
                .contains("vehicle={")
                .contains("brand=BMW, model=320i")
                .contains("mileageKm=45000")
                .contains("fuelType=GASOLINE, gearbox=AUTOMATIC")
                .contains("attributes={tramerAmount=0}")
                .contains("marketPriceBenchmark={sampleSize=3, min=1800000, max=2200000, avg=2000000, current=1800000, currency=TRY, status=Good Deal}");

        RealEstateListingDto realEstate = new RealEstateListingDto();
        realEstate.setId(listingId);
        realEstate.setTitle("Kadıköy Moda 3+1 Daire");
        realEstate.setType(ListingType.REAL_ESTATE);
        realEstate.setStatus(ListingStatus.ACTIVE);
        realEstate.setPrice(new BigDecimal("9500000"));
        realEstate.setCurrency(Currency.TRY);
        realEstate.setGrossAreaM2(140);
        realEstate.setNetAreaM2(120);
        realEstate.setRoomConfigKey("3+1");
        realEstate.setFloorNumber(4);
        realEstate.setTotalFloors(8);
        realEstate.setBuildingAge(5);
        when(listingQueryService.findByIdAsDto(listingId, 5L, 5L)).thenReturn(Optional.of(realEstate));

        AgentContextSection reSection = focusAdapter.fetch(
                5L,
                new AgentUiContextRequest("listing_detail", "/listings/" + listingId, listingId.toString(), null)
        );
        assertThat(reSection.summary())
                .contains("realEstate={")
                .contains("grossM2=140, netM2=120, rooms=3+1")
                .contains("floor=4, totalFloors=8, buildingAge=5");
    }

    @Test
    void searchOrchestrator_skipsGlobalSearchWhenLlmExplicitlyReturnsNone() {
        when(geminiClient.generateJsonForMemory(anyString()))
                .thenReturn("{\"mode\":\"NONE\",\"searchQuery\":null,\"category\":null,\"resultSize\":8}");

        AgentSearchAugmentation aug = searchOrchestrator.augment(5L, "Siparişim ne zaman kargolanır?", "");

        assertThat(aug.liveSearchBlock()).isEmpty();
        assertThat(aug.suggestedListings()).isEmpty();
        verify(listingSearchService, never()).globalSearch(anyString(), anyInt(), anyInt(), anyLong());
        verify(listingSearchService, never()).filterByCategory(any(), anyLong());
    }

    @Test
    void searchOrchestrator_appliesHybridCategoryCityAndSpecFilters() {
        when(geminiClient.generateJsonForMemory(anyString()))
                .thenReturn("""
                        {
                          "mode": "GLOBAL_TEXT",
                          "searchQuery": "MacBook Pro",
                          "category": "ELECTRONICS",
                          "maxPrice": 60000,
                          "city": "İstanbul",
                          "minRam": 16,
                          "resultSize": 6
                        }
                        """);

        ElectronicListingDto found = new ElectronicListingDto();
        found.setId(UUID.randomUUID());
        found.setListingNo("EL-42");
        found.setType(ListingType.ELECTRONICS);
        found.setTitle("MacBook Pro M2 16GB");
        found.setPrice(new BigDecimal("54000"));
        found.setCurrency(Currency.TRY);
        found.setCity("İstanbul");
        found.setDistrict("Beşiktaş");
        found.setRam(16);
        found.setStorage(512);

        when(listingSearchService.filterByCategory(any(ElectronicListingFilterDto.class), eq(5L)))
                .thenAnswer(inv -> {
                    ElectronicListingFilterDto filter = inv.getArgument(0);
                    assertThat(filter.getTitle()).isEqualTo("MacBook Pro");
                    assertThat(filter.getCity()).isEqualTo("İstanbul");
                    assertThat(filter.getMaxPrice()).isEqualByComparingTo("60000");
                    assertThat(filter.getMinRam()).isEqualTo(16);
                    return new PageImpl<ListingDto>(List.of(found));
                });

        AgentSearchAugmentation aug = searchOrchestrator.augment(5L, "İstanbul'da 60 bin altı 16GB MacBook Pro öner", "");

        assertThat(aug.suggestedListings()).hasSize(1);
        assertThat(aug.liveSearchBlock()).contains("özellikler=16GB RAM, 512GB");
    }
}
