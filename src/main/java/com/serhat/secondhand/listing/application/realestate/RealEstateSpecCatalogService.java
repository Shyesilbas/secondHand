package com.serhat.secondhand.listing.application.realestate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

/**
 * Provides in-memory catalog data for real estate listing specs.
 * <p>
 * Heating types are <b>not</b> served from this catalog — they are managed as
 * full DB reference entities (see {@code HeatingType} and
 * {@code GET /api/v1/enums/all}).
 * This service only exposes non-entity catalogs: room configurations and
 * zoning statuses.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealEstateSpecCatalogService {

    private static final String CATALOG_PATH = "data/realestate/specs.json";

    private final ObjectMapper objectMapper;

    private final List<SpecDto> roomConfigs = new ArrayList<>();
    private final List<SpecDto> zoningStatuses = new ArrayList<>();

    private final Set<String> validRoomConfigKeys = new HashSet<>();
    private final Set<String> validZoningStatusKeys = new HashSet<>();

    @PostConstruct
    public void init() {
        try {
            loadCatalog();
            log.info("Real Estate specs catalog loaded successfully");
        } catch (Exception e) {
            log.error("Failed to load Real Estate specs catalog from: {}", CATALOG_PATH, e);
            throw new RuntimeException("Real Estate specs catalog initialization failed", e);
        }
    }

    private void loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            parseSpecNode(root.get("roomConfigs"), roomConfigs, validRoomConfigKeys);
            parseSpecNode(root.get("zoningStatuses"), zoningStatuses, validZoningStatusKeys);
        }
    }

    private void parseSpecNode(JsonNode node, List<SpecDto> targetList, Set<String> targetKeys) {
        if (node == null || !node.isArray()) return;
        for (JsonNode spec : node) {
            String key = spec.get("key").asText();
            String label = spec.get("label").asText();
            Integer rooms = spec.has("rooms") ? spec.get("rooms").asInt() : null;
            Integer livingRooms = spec.has("livingRooms") ? spec.get("livingRooms").asInt() : null;
            targetList.add(new SpecDto(key, label, rooms, livingRooms));
            targetKeys.add(key.trim().toUpperCase(Locale.ROOT));
        }
    }

    // ── Public Accessors ────────────────────────────────────────────────

    public List<SpecDto> getRoomConfigs() {
        return Collections.unmodifiableList(roomConfigs);
    }

    public List<SpecDto> getZoningStatuses() {
        return Collections.unmodifiableList(zoningStatuses);
    }

    public Optional<SpecDto> findRoomConfig(String key) {
        if (key == null || key.isBlank()) return Optional.empty();
        String normalized = key.trim();
        return roomConfigs.stream()
                .filter(c -> c.getKey().equalsIgnoreCase(normalized))
                .findFirst();
    }

    public Optional<SpecDto> findZoningStatus(String key) {
        if (key == null || key.isBlank()) return Optional.empty();
        String normalized = key.trim();
        return zoningStatuses.stream()
                .filter(z -> z.getKey().equalsIgnoreCase(normalized))
                .findFirst();
    }

    // ── Validation Helpers ──────────────────────────────────────────────

    public boolean isValidRoomConfig(String key) {
        if (key == null || key.isBlank()) return false;
        return validRoomConfigKeys.contains(key.trim().toUpperCase(Locale.ROOT));
    }

    public boolean isValidZoningStatus(String key) {
        if (key == null || key.isBlank()) return false;
        return validZoningStatusKeys.contains(key.trim().toUpperCase(Locale.ROOT));
    }

    @Data
    public static class SpecDto {
        private final String key;
        private final String label;
        private final Integer rooms;
        private final Integer livingRooms;

        public SpecDto(String key, String label) {
            this(key, label, null, null);
        }

        public SpecDto(String key, String label, Integer rooms, Integer livingRooms) {
            this.key = key;
            this.label = label;
            this.rooms = rooms;
            this.livingRooms = livingRooms;
        }
    }
}
