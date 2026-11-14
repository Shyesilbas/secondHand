package com.serhat.secondhand.listing.application.generator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ListingGeneratorSupportTest {

    @Test
    void baseRequest_populatesTryCurrencyAndLocationFields() {
        var place = new GeneratorLocations.Place("ISTANBUL", "İstanbul", "KADIKOY", "Kadıköy", "MODA");

        BaseListingCreateRequest request = ListingGeneratorSupport.baseRequest(
                "Sample Title",
                "Sample Description",
                new BigDecimal("12500.00"),
                place,
                "https://cdn.example/img.jpg",
                true
        );

        assertThat(request.title()).isEqualTo("Sample Title");
        assertThat(request.description()).isEqualTo("Sample Description");
        assertThat(request.price()).isEqualByComparingTo("12500.00");
        assertThat(request.currency()).isEqualTo(Currency.TRY);
        assertThat(request.city()).isEqualTo("İstanbul");
        assertThat(request.district()).isEqualTo("Kadıköy");
        assertThat(request.cityKey()).isEqualTo("ISTANBUL");
        assertThat(request.districtKey()).isEqualTo("KADIKOY");
        assertThat(request.neighborhoodKey()).isEqualTo("MODA");
        assertThat(request.imageUrl()).isEqualTo("https://cdn.example/img.jpg");
        assertThat(request.allowMeetup()).isTrue();
    }

    @Test
    void requireCreated_returnsIdOnSuccessAndThrowsOnError() {
        UUID expectedId = UUID.randomUUID();
        assertThat(ListingGeneratorSupport.requireCreated(Result.success(expectedId), "vehicle", "Golf"))
                .isEqualTo(expectedId);

        assertThatThrownBy(() -> ListingGeneratorSupport.requireCreated(
                Result.error("Bad title", "INVALID_TITLE"), "book", "1984"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("book")
                .hasMessageContaining("INVALID_TITLE");
    }

    @Test
    void listingAttributes_keepsOnlyListingLevelDefinitions() {
        ListingAttributeCatalogService catalog = mock(ListingAttributeCatalogService.class);
        var catalogAttr = new AttributeDefinitionDto();
        catalogAttr.setKey("engine");
        catalogAttr.setLevel(AttributeLevel.CATALOG);

        var listingAttr = new AttributeDefinitionDto();
        listingAttr.setKey("damageMap");
        listingAttr.setLevel(AttributeLevel.LISTING);

        when(catalog.getDefinitions(ListingType.VEHICLE, "CAR"))
                .thenReturn(List.of(catalogAttr, listingAttr));

        Map<String, AttributeDefinitionDto> defs = ListingGeneratorSupport.listingAttributes(
                catalog, ListingType.VEHICLE, "CAR");

        assertThat(defs).containsOnlyKeys("damageMap");
    }

    @Test
    void formattingAndWeights_produceDeterministicOutput() {
        assertThat(ListingGeneratorSupport.formatGroupedInt(125000)).isEqualTo("125.000");
        assertThat(ListingGeneratorSupport.formatTry(45000)).isEqualTo("45.000 TL");
        assertThat(ListingGeneratorSupport.truncate("abcdef ", 6)).isEqualTo("abcdef");

        Map<String, Integer> ordered = GeneratorRandom.weights("FIRST", 70, "SECOND", 30);
        assertThat(ordered.keySet()).containsExactly("FIRST", "SECOND");
        assertThat(ordered.get("FIRST")).isEqualTo(70);
    }
}
