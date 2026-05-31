package com.serhat.secondhand.listing.application.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Duration;
import java.util.*;

/**
 * Location catalog servisi — tüm veri Redis'te yaşar, JVM heap'te tutulmaz.
 *
 * <h3>Tasarım</h3>
 * <ul>
 *   <li><b>getCities / getDistricts / getNeighborhoods</b> → Spring {@code @Cacheable}
 *       ile Redis'e gider; hit varsa JSON parse yapılmaz.</li>
 *   <li><b>Validation metodları</b> → aynı cache üzerinden çalışır,
 *       ayrı in-memory map tutulmaz.</li>
 *   <li><b>Restart-safe:</b> {@code @PostConstruct} içinde önce Redis'e bakılır;
 *       veri zaten varsa JSON yüklenmez → restart'ta cache silinmez.</li>
 *   <li><b>TTL:</b> 7 gün (CacheConfig içindeki "locations" konfigürasyonu).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationCatalogService {

    private static final String CATALOG_PATH = "data/common/locations.json";
    private static final String SENTINEL_KEY = "location::sentinel::v2";
    private static final Duration SENTINEL_TTL = Duration.ofDays(8);

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    // ── Başlatma ────────────────────────────────────────────────────────

    /**
     * Uygulama ayağa kalkarken çalışır.
     * Redis'te sentinel key varsa hiçbir şey yapmaz (restart-safe).
     * Yoksa JSON'dan parse edip Redis'e yazar; JVM heap'te veri tutulmaz.
     */
    @PostConstruct
    public void init() {
        Boolean exists = redisTemplate.hasKey(SENTINEL_KEY);
        if (Boolean.TRUE.equals(exists)) {
            log.info("[LocationCatalog] Redis cache mevcut — JSON parse atlandı (restart-safe).");
            return;
        }
        log.info("[LocationCatalog] Redis'te veri yok, locations.json yükleniyor...");
        try {
            loadAndPopulateRedis();
            redisTemplate.opsForValue().set(SENTINEL_KEY, "1", SENTINEL_TTL);
            log.info("[LocationCatalog] Yükleme tamamlandı.");
        } catch (Exception e) {
            log.error("[LocationCatalog] locations.json yuklenemedi: {}", CATALOG_PATH, e);
            throw new RuntimeException("Locations catalog initialization failed", e);
        }
    }

    // ── Public API — Spring Cache (@Cacheable) ───────────────────────────

    @Cacheable(cacheNames = "locations", key = "'cities'")
    public List<CityDto> getCities() {
        log.warn("[LocationCatalog] getCities cache miss — JSON fallback.");
        return loadCitiesFromJson();
    }

    @Cacheable(cacheNames = "locations", key = "'districts::' + #cityKey.toUpperCase()")
    public List<DistrictDto> getDistricts(String cityKey) {
        if (cityKey == null) return Collections.emptyList();
        log.warn("[LocationCatalog] getDistricts cache miss: {}", cityKey);
        return loadDistrictsFromJson(cityKey.toUpperCase());
    }

    @Cacheable(cacheNames = "locations", key = "'neighborhoods::' + #districtKey.toUpperCase()")
    public List<NeighborhoodDto> getNeighborhoods(String districtKey) {
        if (districtKey == null) return Collections.emptyList();
        log.warn("[LocationCatalog] getNeighborhoods cache miss: {}", districtKey);
        return loadNeighborhoodsFromJson(districtKey.toUpperCase());
    }

    // ── Validation Helpers (cache uzerinden) ────────────────────────────

    public boolean isValidCity(String cityKey) {
        if (cityKey == null) return false;
        String upper = cityKey.toUpperCase();
        return getCities().stream().anyMatch(c -> upper.equals(c.getKey()));
    }

    public boolean isValidDistrict(String cityKey, String districtKey) {
        if (cityKey == null || districtKey == null) return false;
        String upper = districtKey.toUpperCase();
        return getDistricts(cityKey).stream().anyMatch(d -> upper.equals(d.getKey()));
    }

    public boolean isValidNeighborhood(String districtKey, String neighborhoodKey) {
        if (districtKey == null || neighborhoodKey == null) return false;
        String upper = neighborhoodKey.toUpperCase();
        return getNeighborhoods(districtKey).stream().anyMatch(n -> upper.equals(n.getKey()));
    }

    // ── Redis Populate (sadece ilk yuklemede) ────────────────────────────

    /**
     * JSON'u parse edip tum city/district/neighborhood listelerini
     * dogrudan RedisTemplate ile yazar (Spring Cache proxy disinda self-call).
     * Key formati CacheConfig computePrefixWith ile uyumludur: v4::locations::...
     */
    private void loadAndPopulateRedis() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode citiesNode = root.get("cities");
            if (citiesNode == null || !citiesNode.isArray()) return;

            List<CityDto> cities = new ArrayList<>();

            for (JsonNode cityNode : citiesNode) {
                String cityKey = cityNode.get("key").asText();
                String cityLabel = cityNode.get("label").asText();
                cities.add(new CityDto(cityKey, cityLabel));

                List<DistrictDto> districts = new ArrayList<>();
                JsonNode districtsNode = cityNode.get("districts");
                if (districtsNode != null && districtsNode.isArray()) {
                    for (JsonNode districtNode : districtsNode) {
                        String districtKey = districtNode.get("key").asText();
                        String districtLabel = districtNode.get("label").asText();
                        districts.add(new DistrictDto(districtKey, districtLabel));

                        List<NeighborhoodDto> neighborhoods = new ArrayList<>();
                        JsonNode neighborhoodsNode = districtNode.get("neighborhoods");
                        if (neighborhoodsNode != null && neighborhoodsNode.isArray()) {
                            for (JsonNode neighborhoodNode : neighborhoodsNode) {
                                String nbKey = neighborhoodNode.get("key").asText();
                                String nbLabel = neighborhoodNode.get("label").asText();
                                neighborhoods.add(new NeighborhoodDto(nbKey, nbLabel));
                            }
                        }
                        writeToCache("neighborhoods::" + districtKey, neighborhoods);
                    }
                }
                writeToCache("districts::" + cityKey, districts);
            }
            writeToCache("cities", cities);
        }
    }

    /**
     * CacheConfig computePrefixWith formatiyla (v4::locations::...) Redis'e yazar.
     */
    private void writeToCache(String cacheKey, Object value) {
        String redisKey = "v4::locations::" + cacheKey;
        redisTemplate.opsForValue().set(redisKey, value, Duration.ofDays(7));
    }

    // ── JSON Fallback (cache miss durumunda) ─────────────────────────────

    private List<CityDto> loadCitiesFromJson() {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode nodes = root.get("cities");
            if (nodes == null) return Collections.emptyList();
            List<CityDto> result = new ArrayList<>();
            for (JsonNode n : nodes)
                result.add(new CityDto(n.get("key").asText(), n.get("label").asText()));
            return result;
        } catch (Exception e) {
            log.error("[LocationCatalog] loadCitiesFromJson hatasi", e);
            return Collections.emptyList();
        }
    }

    private List<DistrictDto> loadDistrictsFromJson(String cityKey) {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            for (JsonNode cityNode : root.get("cities")) {
                if (cityKey.equals(cityNode.get("key").asText())) {
                    List<DistrictDto> result = new ArrayList<>();
                    for (JsonNode d : cityNode.get("districts"))
                        result.add(new DistrictDto(d.get("key").asText(), d.get("label").asText()));
                    return result;
                }
            }
        } catch (Exception e) {
            log.error("[LocationCatalog] loadDistrictsFromJson hatasi: {}", cityKey, e);
        }
        return Collections.emptyList();
    }

    private List<NeighborhoodDto> loadNeighborhoodsFromJson(String districtKey) {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            for (JsonNode cityNode : root.get("cities")) {
                for (JsonNode d : cityNode.get("districts")) {
                    if (districtKey.equals(d.get("key").asText())) {
                        List<NeighborhoodDto> result = new ArrayList<>();
                        JsonNode nbNodes = d.get("neighborhoods");
                        if (nbNodes != null)
                            for (JsonNode nb : nbNodes)
                                result.add(new NeighborhoodDto(nb.get("key").asText(), nb.get("label").asText()));
                        return result;
                    }
                }
            }
        } catch (Exception e) {
            log.error("[LocationCatalog] loadNeighborhoodsFromJson hatasi: {}", districtKey, e);
        }
        return Collections.emptyList();
    }

    // ── Inner Data Transfer Records ──────────────────────────────────────

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CityDto {
        private String key;
        private String label;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistrictDto {
        private String key;
        private String label;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NeighborhoodDto {
        private String key;
        private String label;
    }
}
