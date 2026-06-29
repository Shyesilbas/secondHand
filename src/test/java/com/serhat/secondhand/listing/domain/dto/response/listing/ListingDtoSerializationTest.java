package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.config.CacheConfig;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Method;
import static org.junit.jupiter.api.Assertions.*;

class ListingDtoSerializationTest {

    @Test
    void testListingDtoCacheSerialization() throws Exception {
        CacheConfig config = new CacheConfig();
        Method method = CacheConfig.class.getDeclaredMethod("buildCacheObjectMapper");
        method.setAccessible(true);
        ObjectMapper mapper = (ObjectMapper) method.invoke(config);

        SportsListingDto sportsListing = new SportsListingDto();
        sportsListing.setType(ListingType.SPORTS);
        sportsListing.setTitle("Test Sports Item");

        String json = mapper.writeValueAsString(sportsListing);
        assertNotNull(json);
        // Verify type is serialized as a plain string "SPORTS" rather than wrapped with class array info
        assertTrue(json.contains("\"type\":\"SPORTS\""));

        ListingDto deserialized = mapper.readValue(json, ListingDto.class);
        assertNotNull(deserialized);
        assertEquals(ListingType.SPORTS, deserialized.getType());
    }
}
