package com.serhat.secondhand.listing.application.filter;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** The public filter endpoints must never return draft, inactive, reserved or deleted listings. */
class FilterHelperTest {

    @Test
    void missingStatusDefaultsToActive() {
        ListingFilterDto filters = new SportsListingFilterDto();

        FilterHelper.initializeFilter(filters);

        assertThat(filters.getStatus()).isEqualTo(ListingStatus.ACTIVE);
    }

    @ParameterizedTest
    @EnumSource(value = ListingStatus.class, names = {"ACTIVE", "SOLD"})
    void publicStatusesAreAccepted(ListingStatus status) {
        ListingFilterDto filters = new SportsListingFilterDto();
        filters.setStatus(status);

        FilterHelper.initializeFilter(filters);

        assertThat(filters.getStatus()).isEqualTo(status);
    }

    @ParameterizedTest
    @EnumSource(value = ListingStatus.class, names = {"DRAFT", "INACTIVE", "DELETED"})
    void ownerOnlyStatusesAreRejected(ListingStatus status) {
        ListingFilterDto filters = new SportsListingFilterDto();
        filters.setStatus(status);

        assertThatThrownBy(() -> FilterHelper.initializeFilter(filters))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getErrorCode())
                        .isEqualTo(ListingErrorCodes.INVALID_LISTING_STATUS.getCode()));
    }

    /** A client cannot ask the public filter for an unbounded page. */
    @Test
    void pageSizeIsCapped() {
        ListingFilterDto filters = new SportsListingFilterDto();
        filters.setSize(100_000);
        filters.setPage(-3);

        org.springframework.data.domain.Pageable pageable = FilterHelper.initializeFilter(filters);

        assertThat(pageable.getPageSize()).isEqualTo(com.serhat.secondhand.core.dto.PageRequests.MAX_PAGE_SIZE);
        assertThat(pageable.getPageNumber()).isZero();
    }

    /** With a catalog key present, the unindexable label LIKE is not added. */
    @Test
    @SuppressWarnings("unchecked")
    void locationKeySkipsLabelLike() {
        jakarta.persistence.criteria.CriteriaBuilder cb = org.mockito.Mockito.mock(jakarta.persistence.criteria.CriteriaBuilder.class);
        jakarta.persistence.criteria.Root<Object> root = org.mockito.Mockito.mock(jakarta.persistence.criteria.Root.class);
        ListingFilterDto filters = new SportsListingFilterDto();
        filters.setCityKey("ISTANBUL");
        filters.setCity("Istanbul");
        filters.setDistrictKey("KADIKOY");
        filters.setDistrict("Kadikoy");

        FilterHelper.buildBasePredicates(cb, root, filters);

        org.mockito.Mockito.verify(cb, org.mockito.Mockito.never())
                .like(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString());
    }
}
