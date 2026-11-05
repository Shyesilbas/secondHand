package com.serhat.secondhand.listing.application.query;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.application.books.BooksListingService;
import com.serhat.secondhand.listing.application.clothing.ClothingListingService;
import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.application.electronics.ElectronicListingService;
import com.serhat.secondhand.listing.application.realestate.RealEstateListingService;
import com.serhat.secondhand.listing.application.sports.SportsListingService;
import com.serhat.secondhand.listing.application.vehicle.VehicleListingService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Page;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class ListingSearchServiceEmptyResultTest {

    private final ListingRepository listingRepository = mock(ListingRepository.class);

    private final ListingSearchService service = new ListingSearchService(
            listingRepository,
            mock(ListingMapper.class),
            mock(ListingEnrichmentService.class),
            mock(BooksListingService.class),
            mock(ClothingListingService.class),
            mock(ElectronicListingService.class),
            mock(RealEstateListingService.class),
            mock(SportsListingService.class),
            mock(VehicleListingService.class));

    // "a" is too short, "yeni" and "en son" are stop words, " " is blank: no usable search token.
    @ParameterizedTest
    @ValueSource(strings = {"a", "yeni", "en son", " "})
    void queryWithoutUsableTokenReturnsSerializablePagedEmptyPage(String query) {
        Page<ListingDto> result = service.globalSearch(query, 2, 8, null);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getPageable().isPaged()).isTrue();
        assertThat(result.getNumber()).isEqualTo(2);
        assertThat(result.getSize()).isEqualTo(8);
        assertThatCode(() -> new ObjectMapper().findAndRegisterModules().writeValueAsString(result))
                .doesNotThrowAnyException();
        verifyNoInteractions(listingRepository);
    }
}
