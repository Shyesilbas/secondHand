package com.serhat.secondhand.listing.application.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationCatalogServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private LocationCatalogService locationCatalogService;

    @BeforeEach
    void setUp() {
        locationCatalogService = new LocationCatalogService(objectMapper, redisTemplate);
    }

    @Test
    void catalogLoadsAll81ProvincesAnd973Districts() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null); // Force JSON fallback

        List<LocationCatalogService.CityDto> cities = locationCatalogService.getCities();
        assertThat(cities).hasSize(81);

        int totalDistricts = 0;
        int emptyNeighborhoodDistricts = 0;

        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.get(anyString(), anyString())).thenReturn(null); // Force JSON fallback

        for (LocationCatalogService.CityDto city : cities) {
            List<LocationCatalogService.DistrictDto> districts = locationCatalogService.getDistricts(city.getKey());
            totalDistricts += districts.size();

            for (LocationCatalogService.DistrictDto district : districts) {
                List<LocationCatalogService.NeighborhoodDto> nbs = locationCatalogService.getNeighborhoods(district.getKey());
                if (nbs.isEmpty()) {
                    emptyNeighborhoodDistricts++;
                }
            }
        }

        assertThat(totalDistricts).isEqualTo(973);
        assertThat(emptyNeighborhoodDistricts).isEqualTo(0);
    }

    @Test
    void istanbulHas39DistrictsAndRichNeighborhoods() {
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.get(anyString(), anyString())).thenReturn(null);

        List<LocationCatalogService.DistrictDto> istanbulDistricts = locationCatalogService.getDistricts("ISTANBUL");
        assertThat(istanbulDistricts).hasSize(39);
        assertThat(istanbulDistricts).extracting(LocationCatalogService.DistrictDto::getKey)
                .contains("ISTANBUL_ARNAVUTKOY", "ISTANBUL_SULTANBEYLI", "ISTANBUL_KADIKOY", "ISTANBUL_UMRANIYE");

        List<LocationCatalogService.NeighborhoodDto> kadikoyNbs = locationCatalogService.getNeighborhoods("ISTANBUL_KADIKOY");
        assertThat(kadikoyNbs).isNotEmpty();
        assertThat(kadikoyNbs).extracting(LocationCatalogService.NeighborhoodDto::getLabel)
                .contains("Moda (Caferağa)", "Caddebostan", "Suadiye", "Fenerbahçe", "Bostancı");

        List<LocationCatalogService.NeighborhoodDto> umraniyeNbs = locationCatalogService.getNeighborhoods("ISTANBUL_UMRANIYE");
        assertThat(umraniyeNbs).isNotEmpty();
        assertThat(umraniyeNbs).extracting(LocationCatalogService.NeighborhoodDto::getLabel)
                .contains("Atakent", "Çakmak", "Ihlamurkuyu", "Şerifali");
    }

    @Test
    void validationMethods_workAccurately() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.get(anyString(), anyString())).thenReturn(null);

        assertThat(locationCatalogService.isValidCity("ISTANBUL")).isTrue();
        assertThat(locationCatalogService.isValidCity("INVALID_CITY")).isFalse();

        assertThat(locationCatalogService.isValidDistrict("ISTANBUL", "ISTANBUL_KADIKOY")).isTrue();
        assertThat(locationCatalogService.isValidDistrict("ANKARA", "ISTANBUL_KADIKOY")).isFalse();

        assertThat(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "ISTANBUL_KADIKOY_CADDEBOSTAN")).isTrue();
        assertThat(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "NON_EXISTING_NB")).isFalse();
    }
}
