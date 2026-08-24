package com.serhat.secondhand.listing.application.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Duration;
import java.util.*;

/**
 * Location catalog servisi — tüm coğrafi veri Redis Hash yapısında yaşar, JVM heap'te tutulmaz.
 *
 * <h3>Tasarım</h3>
 * <ul>
 *   <li><b>Hiyerarşik Redis Hash:</b> 900+ tekil string key yerine 3 anahtar (cities, districts hash, neighborhoods hash)
 *       kullanılarak anahtar kalabalığı ve bellek ayak izi minimize edilmiştir.</li>
 *   <li><b>getCities / getDistricts / getNeighborhoods</b> → Redis Hash (HGET / GET) üzerinden O(1) okunur.</li>
 *   <li><b>Validation metodları</b> → doğrudan aynı Redis yapısı üzerinden doğrular.</li>
 *   <li><b>Restart-safe:</b> {@code @PostConstruct} içinde önce sentinel key kontrol edilir;
 *       veri varsa JSON parse atlanır.</li>
 *   <li><b>TTL:</b> 7 gün.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationCatalogService {

    private static final String CATALOG_PATH = "data/common/locations.json";
    private static final String CITIES_KEY = "v4:catalog:locations:cities";
    private static final String DISTRICTS_HASH_KEY = "v4:catalog:locations:districts";
    private static final String NEIGHBORHOODS_HASH_KEY = "v4:catalog:locations:neighborhoods";
    private static final String SENTINEL_KEY = "v4:catalog:locations:sentinel";
    private static final Duration CATALOG_TTL = Duration.ofDays(7);
    private static final Duration SENTINEL_TTL = Duration.ofDays(8);

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    // ── Başlatma ────────────────────────────────────────────────────────

    /**
     * Uygulama ayağa kalkarken çalışır.
     * Redis'te sentinel key varsa hiçbir şey yapmaz (restart-safe).
     * Yoksa JSON'dan parse edip Redis Hash yapılarına yazar; JVM heap'te veri tutulmaz.
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

    // ── Public API — Redis Hash / Value Access ───────────────────────────

    @SuppressWarnings("unchecked")
    public List<CityDto> getCities() {
        try {
            Object cached = redisTemplate.opsForValue().get(CITIES_KEY);
            if (cached instanceof List<?>) {
                return (List<CityDto>) cached;
            }
        } catch (Exception e) {
            log.warn("[LocationCatalog] getCities Redis okuma hatası, JSON fallback devreye giriyor: {}", e.getMessage());
        }
        List<CityDto> fallback = loadCitiesFromJson();
        if (!fallback.isEmpty()) {
            redisTemplate.opsForValue().set(CITIES_KEY, fallback, CATALOG_TTL);
        }
        return fallback;
    }

    @SuppressWarnings("unchecked")
    public List<DistrictDto> getDistricts(String cityKey) {
        if (cityKey == null || cityKey.isBlank()) return Collections.emptyList();
        String normalizedKey = cityKey.trim().toUpperCase(Locale.ENGLISH);
        try {
            Object cached = redisTemplate.opsForHash().get(DISTRICTS_HASH_KEY, normalizedKey);
            if (cached instanceof List<?>) {
                return (List<DistrictDto>) cached;
            }
        } catch (Exception e) {
            log.warn("[LocationCatalog] getDistricts Redis okuma hatası: {} | {}", normalizedKey, e.getMessage());
        }
        List<DistrictDto> fallback = loadDistrictsFromJson(normalizedKey);
        if (!fallback.isEmpty()) {
            redisTemplate.opsForHash().put(DISTRICTS_HASH_KEY, normalizedKey, fallback);
            redisTemplate.expire(DISTRICTS_HASH_KEY, CATALOG_TTL);
        }
        return fallback;
    }

    @SuppressWarnings("unchecked")
    public List<NeighborhoodDto> getNeighborhoods(String districtKey) {
        if (districtKey == null || districtKey.isBlank()) return Collections.emptyList();
        String normalizedKey = districtKey.trim().toUpperCase(Locale.ENGLISH);
        try {
            Object cached = redisTemplate.opsForHash().get(NEIGHBORHOODS_HASH_KEY, normalizedKey);
            if (cached instanceof List<?>) {
                return (List<NeighborhoodDto>) cached;
            }
        } catch (Exception e) {
            log.warn("[LocationCatalog] getNeighborhoods Redis okuma hatası: {} | {}", normalizedKey, e.getMessage());
        }
        List<NeighborhoodDto> fallback = loadNeighborhoodsFromJson(normalizedKey);
        if (!fallback.isEmpty()) {
            redisTemplate.opsForHash().put(NEIGHBORHOODS_HASH_KEY, normalizedKey, fallback);
            redisTemplate.expire(NEIGHBORHOODS_HASH_KEY, CATALOG_TTL);
        }
        return fallback;
    }

    // ── Validation Helpers (cache uzerinden) ────────────────────────────

    public boolean isValidCity(String cityKey) {
        if (cityKey == null) return false;
        String upper = cityKey.toUpperCase(Locale.ENGLISH);
        return getCities().stream().anyMatch(c -> upper.equals(c.getKey()));
    }

    public boolean isValidDistrict(String cityKey, String districtKey) {
        if (cityKey == null || districtKey == null) return false;
        String upper = districtKey.toUpperCase(Locale.ENGLISH);
        return getDistricts(cityKey).stream().anyMatch(d -> upper.equals(d.getKey()));
    }

    public boolean isValidNeighborhood(String districtKey, String neighborhoodKey) {
        if (districtKey == null || neighborhoodKey == null) return false;
        String upper = neighborhoodKey.toUpperCase(Locale.ENGLISH);
        return getNeighborhoods(districtKey).stream().anyMatch(n -> upper.equals(n.getKey()));
    }

    // ── Redis Populate (sadece ilk yuklemede) ────────────────────────────

    /**
     * JSON'u parse edip tüm city/district/neighborhood yapılarını Redis Hash ve Value olarak kaydeder.
     */
    private void loadAndPopulateRedis() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode citiesNode = root.get("cities");
            if (citiesNode == null || !citiesNode.isArray()) return;

            List<CityDto> cities = new ArrayList<>();
            Map<String, Object> districtsMap = new HashMap<>();
            Map<String, Object> neighborhoodsMap = new HashMap<>();

            for (JsonNode cityNode : citiesNode) {
                String cityKey = cityNode.get("key").asText().toUpperCase(Locale.ENGLISH);
                String cityLabel = cityNode.get("label").asText();
                cities.add(new CityDto(cityKey, cityLabel));

                List<DistrictDto> districts = new ArrayList<>();
                JsonNode districtsNode = cityNode.get("districts");
                if (districtsNode != null && districtsNode.isArray()) {
                    for (JsonNode districtNode : districtsNode) {
                        String districtKey = districtNode.get("key").asText().toUpperCase(Locale.ENGLISH);
                        String districtLabel = districtNode.get("label").asText();
                        districts.add(new DistrictDto(districtKey, districtLabel));

                        List<NeighborhoodDto> neighborhoods = new ArrayList<>();
                        JsonNode neighborhoodsNode = districtNode.get("neighborhoods");
                        if (neighborhoodsNode != null && neighborhoodsNode.isArray()) {
                            for (JsonNode neighborhoodNode : neighborhoodsNode) {
                                String nbKey = neighborhoodNode.get("key").asText().toUpperCase(Locale.ENGLISH);
                                String nbLabel = neighborhoodNode.get("label").asText();
                                neighborhoods.add(new NeighborhoodDto(nbKey, nbLabel));
                            }
                        }
                        neighborhoodsMap.put(districtKey, neighborhoods);
                    }
                }
                districtsMap.put(cityKey, districts);
            }

            redisTemplate.opsForValue().set(CITIES_KEY, cities, CATALOG_TTL);
            if (!districtsMap.isEmpty()) {
                redisTemplate.opsForHash().putAll(DISTRICTS_HASH_KEY, districtsMap);
                redisTemplate.expire(DISTRICTS_HASH_KEY, CATALOG_TTL);
            }
            if (!neighborhoodsMap.isEmpty()) {
                redisTemplate.opsForHash().putAll(NEIGHBORHOODS_HASH_KEY, neighborhoodsMap);
                redisTemplate.expire(NEIGHBORHOODS_HASH_KEY, CATALOG_TTL);
            }
            log.info("[LocationCatalog] Redis Hash populated: {} cities, {} districts, {} neighborhood groups.",
                    cities.size(), districtsMap.size(), neighborhoodsMap.size());
        }
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
                if (cityKey.equalsIgnoreCase(cityNode.get("key").asText())) {
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
                    if (districtKey.equalsIgnoreCase(d.get("key").asText())) {
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