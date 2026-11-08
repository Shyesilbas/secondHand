package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeOptionDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeDataType;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ListingAttributeValidatorTest {

    private ListingAttributeValidator validator;

    @BeforeEach
    void setUp() {
        ListingAttributeCatalogService catalog = mock(ListingAttributeCatalogService.class);
        List<AttributeDefinitionDto> defs = new ArrayList<>();
        defs.add(def("ownerCount", AttributeDataType.INTEGER, AttributeLevel.LISTING, BigDecimal.ONE, BigDecimal.valueOf(20), List.of()));
        defs.add(def("tramerAmount", AttributeDataType.DECIMAL, AttributeLevel.LISTING, BigDecimal.ZERO, null, List.of()));
        defs.add(def("heavyDamageRecord", AttributeDataType.BOOLEAN, AttributeLevel.LISTING, null, null, List.of()));
        defs.add(def("sellerKind", AttributeDataType.ENUM, AttributeLevel.LISTING, null, null,
                List.of(opt("VALUE", "OWNER"), opt("VALUE", "DEALER"))));
        defs.add(def("options", AttributeDataType.MULTI_ENUM, AttributeLevel.LISTING, null, null,
                List.of(opt("VALUE", "SUNROOF"), opt("VALUE", "NAVIGATION"))));
        defs.add(def("damageMap", AttributeDataType.ENUM_MAP, AttributeLevel.LISTING, null, null,
                List.of(opt("KEY", "hood"), opt("KEY", "roof"), opt("VALUE", "ORIGINAL"), opt("VALUE", "PAINTED"))));
        defs.add(def("warrantyUntil", AttributeDataType.DATE, AttributeLevel.LISTING, null, null, List.of()));
        defs.add(def("trunkVolume", AttributeDataType.INTEGER, AttributeLevel.CATALOG, null, null, List.of()));
        when(catalog.getDefinitions(eq(ListingType.VEHICLE), eq("CAR"))).thenReturn(defs);
        validator = new ListingAttributeValidator(catalog);
    }

    private static AttributeDefinitionDto def(String key, AttributeDataType type, AttributeLevel level,
                                              BigDecimal min, BigDecimal max, List<AttributeOptionDto> options) {
        return new AttributeDefinitionDto(key, "CAR", key, null, type, level, min, max, false, false, 0, new ArrayList<>(options));
    }

    private static AttributeOptionDto opt(String group, String value) {
        return new AttributeOptionDto(group, value, value, 0);
    }

    private static VehicleListing listing(Map<String, Object> attributes) {
        VehicleType car = new VehicleType();
        car.setName("CAR");
        return VehicleListing.builder()
                .listingType(ListingType.VEHICLE)
                .vehicleType(car)
                .attributes(new LinkedHashMap<>(attributes))
                .build();
    }

    private Result<Void> run(VehicleListing listing) {
        validator.cleanup(listing);
        return validator.validate(listing);
    }

    @Test
    void acceptsValidValuesAndNormalizesThem() {
        Map<String, Object> attrs = new LinkedHashMap<>();
        attrs.put("ownerCount", 2);
        attrs.put("tramerAmount", 12500.5);
        attrs.put("heavyDamageRecord", false);
        attrs.put("sellerKind", " OWNER ");
        attrs.put("options", List.of("SUNROOF", "SUNROOF", "NAVIGATION"));
        attrs.put("damageMap", Map.of("hood", "PAINTED"));
        attrs.put("warrantyUntil", "2027-05-01");
        VehicleListing listing = listing(attrs);

        assertThat(run(listing).isSuccess()).isTrue();
        assertThat(listing.getAttributes().get("ownerCount")).isEqualTo(2L);
        assertThat(listing.getAttributes().get("sellerKind")).isEqualTo("OWNER");
        assertThat(listing.getAttributes().get("options")).isEqualTo(List.of("SUNROOF", "NAVIGATION"));
    }

    @Test
    void dropsEmptyValues() {
        Map<String, Object> attrs = new LinkedHashMap<>();
        attrs.put("sellerKind", " ");
        attrs.put("options", List.of());
        attrs.put("ownerCount", null);
        VehicleListing listing = listing(attrs);

        assertThat(run(listing).isSuccess()).isTrue();
        assertThat(listing.getAttributes()).isEmpty();
    }

    @Test
    void rejectsUnknownKey() {
        assertThat(run(listing(Map.of("color2", "red"))).getErrorCode()).isEqualTo("ATTRIBUTE_UNKNOWN");
    }

    @Test
    void rejectsCatalogLevelKey() {
        assertThat(run(listing(Map.of("trunkVolume", 380))).getErrorCode()).isEqualTo("ATTRIBUTE_CATALOG_LEVEL");
    }

    @Test
    void rejectsWrongType() {
        assertThat(run(listing(Map.of("ownerCount", "two"))).getErrorCode()).isEqualTo("ATTRIBUTE_TYPE_MISMATCH");
        assertThat(run(listing(Map.of("ownerCount", 1.5))).getErrorCode()).isEqualTo("ATTRIBUTE_TYPE_MISMATCH");
        assertThat(run(listing(Map.of("warrantyUntil", "01.05.2027"))).getErrorCode()).isEqualTo("ATTRIBUTE_TYPE_MISMATCH");
    }

    @Test
    void rejectsOutOfRange() {
        assertThat(run(listing(Map.of("ownerCount", 0))).getErrorCode()).isEqualTo("ATTRIBUTE_OUT_OF_RANGE");
        assertThat(run(listing(Map.of("tramerAmount", -1))).getErrorCode()).isEqualTo("ATTRIBUTE_OUT_OF_RANGE");
    }

    @Test
    void rejectsUnknownOptions() {
        assertThat(run(listing(Map.of("sellerKind", "BROKER"))).getErrorCode()).isEqualTo("ATTRIBUTE_INVALID_OPTION");
        assertThat(run(listing(Map.of("options", List.of("JETPACK")))).getErrorCode()).isEqualTo("ATTRIBUTE_INVALID_OPTION");
        assertThat(run(listing(Map.of("damageMap", Map.of("wing", "PAINTED")))).getErrorCode()).isEqualTo("ATTRIBUTE_INVALID_OPTION");
        assertThat(run(listing(Map.of("damageMap", Map.of("hood", "MELTED")))).getErrorCode()).isEqualTo("ATTRIBUTE_INVALID_OPTION");
    }
}
