package com.serhat.secondhand.listing.application.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class LocationCatalogServiceTest {

    @SuppressWarnings("unchecked")
    private final RedisTemplate<String, Object> redisTemplate = mock(RedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, Object> valueOperations = mock(ValueOperations.class);
    @SuppressWarnings("unchecked")
    private final HashOperations<String, Object, Object> hashOperations = mock(HashOperations.class);

    /** In-memory stand-in for Redis: plain values and hashes by key. */
    private final Map<String, Object> values = new HashMap<>();
    private final Map<String, Map<Object, Object>> hashes = new HashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private LocationCatalogService locationCatalogService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        lenient().when(redisTemplate.hasKey(anyString()))
                .thenAnswer(i -> values.containsKey(i.<String>getArgument(0)) || hashes.containsKey(i.<String>getArgument(0)));
        lenient().doAnswer(i -> values.put(i.getArgument(0), i.getArgument(1)))
                .when(valueOperations).set(anyString(), any(), any(Duration.class));
        lenient().when(valueOperations.get(anyString())).thenAnswer(i -> values.get(i.<String>getArgument(0)));
        lenient().doAnswer(i -> {
            hashes.computeIfAbsent(i.getArgument(0), k -> new HashMap<>()).putAll(i.getArgument(1));
            return null;
        }).when(hashOperations).putAll(anyString(), anyMap());
        lenient().when(hashOperations.get(anyString(), any()))
                .thenAnswer(i -> hashes.getOrDefault(i.<String>getArgument(0), Map.of()).get(i.getArgument(1)));
        locationCatalogService = new LocationCatalogService(objectMapper, redisTemplate);
    }

    @Test
    void catalogLoadsAll81ProvincesAnd973Districts() {

        List<LocationCatalogService.CityDto> cities = locationCatalogService.getCities();
        assertThat(cities).hasSize(81);

        int totalDistricts = 0;
        int emptyNeighborhoodDistricts = 0;

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

        assertThat(locationCatalogService.isValidCity("ISTANBUL")).isTrue();
        assertThat(locationCatalogService.isValidCity("INVALID_CITY")).isFalse();

        assertThat(locationCatalogService.isValidDistrict("ISTANBUL", "ISTANBUL_KADIKOY")).isTrue();
        assertThat(locationCatalogService.isValidDistrict("ANKARA", "ISTANBUL_KADIKOY")).isFalse();

        assertThat(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "ISTANBUL_KADIKOY_CADDEBOSTAN")).isTrue();
        assertThat(locationCatalogService.isValidNeighborhood("ISTANBUL_KADIKOY", "NON_EXISTING_NB")).isFalse();
    }

    @Test
    void catalogIsParsedOnceThenServedFromRedis() {
        locationCatalogService.init();

        assertThat(locationCatalogService.getDistricts("ISTANBUL")).hasSize(39);
        locationCatalogService.init(); // restart: catalog already present

        verify(valueOperations, times(1)).set(anyString(), any(), any(Duration.class));
        verify(hashOperations, times(2)).putAll(anyString(), anyMap());
    }

    @Test
    void unknownKey_doesNotReloadTheCatalog() {
        locationCatalogService.init();

        assertThat(locationCatalogService.getDistricts("NOT_A_CITY")).isEmpty();
        assertThat(locationCatalogService.getNeighborhoods("NOT_A_DISTRICT"))
                .extracting(LocationCatalogService.NeighborhoodDto::getKey)
                .containsExactly("NOT_A_DISTRICT_MERKEZ");

        // Only the initial population wrote to Redis; the misses neither re-parsed nor cached anything.
        verify(valueOperations, times(1)).set(anyString(), any(), any(Duration.class));
        verify(hashOperations, times(2)).putAll(anyString(), anyMap());
    }

    @Test
    void expiredHash_isReloadedOnNextRead() {
        locationCatalogService.init();
        hashes.clear(); // TTL expired

        assertThat(locationCatalogService.getDistricts("ISTANBUL")).hasSize(39);
        verify(hashOperations, times(4)).putAll(anyString(), anyMap());
    }
}
