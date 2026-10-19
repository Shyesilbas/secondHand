package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.LocationCatalogService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationValidatorTest {

    @Mock
    private LocationCatalogService locationCatalogService;

    private LocationValidator locationValidator;

    @BeforeEach
    void setUp() {
        locationValidator = new LocationValidator(locationCatalogService);
    }

    @Test
    void validate_passesWhenAllLocationFieldsAreValid() {
        Listing listing = new Listing();
        listing.setCityKey("ISTANBUL");
        listing.setDistrictKey("ISTANBUL_KADIKOY");
        listing.setNeighborhoodKey("ISTANBUL_KADIKOY_MODA");

        when(locationCatalogService.isValidCity("ISTANBUL")).thenReturn(true);
        when(locationCatalogService.isValidDistrict("ISTANBUL", "ISTANBUL_KADIKOY")).thenReturn(true);
        when(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "ISTANBUL_KADIKOY_MODA")).thenReturn(true);

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    void validate_passesWhenOptionalLocationFieldsAreEmpty() {
        Listing listing = new Listing();
        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    void validate_failsWhenCityIsInvalid() {
        Listing listing = new Listing();
        listing.setCityKey("UNKNOWN_CITY");

        when(locationCatalogService.isValidCity("UNKNOWN_CITY")).thenReturn(false);

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LOCATION_INVALID_CITY");
    }

    @Test
    void validate_failsWhenDistrictProvidedWithoutCity() {
        Listing listing = new Listing();
        listing.setDistrictKey("ISTANBUL_KADIKOY");

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LOCATION_CITY_REQUIRED_FOR_DISTRICT");
    }

    @Test
    void validate_failsWhenDistrictDoesNotBelongToCity() {
        Listing listing = new Listing();
        listing.setCityKey("ANKARA");
        listing.setDistrictKey("ISTANBUL_KADIKOY");

        when(locationCatalogService.isValidCity("ANKARA")).thenReturn(true);
        when(locationCatalogService.isValidDistrict("ANKARA", "ISTANBUL_KADIKOY")).thenReturn(false);

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LOCATION_INVALID_DISTRICT_FOR_CITY");
    }

    @Test
    void validate_failsWhenNeighborhoodProvidedWithoutDistrict() {
        Listing listing = new Listing();
        listing.setCityKey("ISTANBUL");
        listing.setNeighborhoodKey("ISTANBUL_KADIKOY_MODA");

        when(locationCatalogService.isValidCity("ISTANBUL")).thenReturn(true);

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LOCATION_DISTRICT_REQUIRED_FOR_NEIGHBORHOOD");
    }

    @Test
    void validate_failsWhenNeighborhoodDoesNotBelongToDistrict() {
        Listing listing = new Listing();
        listing.setCityKey("ISTANBUL");
        listing.setDistrictKey("ISTANBUL_KADIKOY");
        listing.setNeighborhoodKey("UNKNOWN_NB");

        when(locationCatalogService.isValidCity("ISTANBUL")).thenReturn(true);
        when(locationCatalogService.isValidDistrict("ISTANBUL", "ISTANBUL_KADIKOY")).thenReturn(true);
        when(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "UNKNOWN_NB")).thenReturn(false);

        Result<Void> result = locationValidator.validate(listing);
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LOCATION_INVALID_NEIGHBORHOOD_FOR_DISTRICT");
    }
}
