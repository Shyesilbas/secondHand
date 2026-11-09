package com.serhat.secondhand.listing.application.size;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Size systems shared by clothing (and later sports) listings, read once from {@code data/common/sizes.json}.
 * A listing stores a system key plus a value key, because value keys repeat across systems ("38" is a women's
 * numeric size and a shoe size). Startup fails when the file is missing or malformed.
 */
@Service
@RequiredArgsConstructor
public class SizeSystemCatalog {

    public static final String ONE_SIZE = "ONE_SIZE";
    private static final String PATH = "data/common/sizes.json";

    public record SizeValue(String key, String label) {
    }

    public record SizeSystem(String key, String label, List<SizeValue> values) {
        public Optional<SizeValue> value(String valueKey) {
            return values.stream().filter(v -> v.key().equals(valueKey)).findFirst();
        }
    }

    private final ObjectMapper objectMapper;
    private final Map<String, SizeSystem> systems = new LinkedHashMap<>();

    @PostConstruct
    public void load() {
        try (InputStream is = new ClassPathResource(PATH).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            for (JsonNode s : root.path("systems")) {
                List<SizeValue> values = new ArrayList<>();
                for (JsonNode v : s.path("values")) {
                    values.add(new SizeValue(v.get("key").asText(), v.get("label").asText()));
                }
                String key = s.get("key").asText();
                if (values.isEmpty()) {
                    throw new IllegalStateException(PATH + ": size system " + key + " has no values");
                }
                systems.put(key, new SizeSystem(key, s.get("label").asText(), List.copyOf(values)));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Size catalog " + PATH + " could not be loaded", e);
        }
        if (!systems.containsKey(ONE_SIZE)) {
            throw new IllegalStateException(PATH + " needs the " + ONE_SIZE + " system");
        }
    }

    public List<SizeSystem> all() {
        return List.copyOf(systems.values());
    }

    public Optional<SizeSystem> find(String systemKey) {
        return Optional.ofNullable(systemKey == null ? null : systems.get(systemKey));
    }

    public boolean contains(String systemKey) {
        return find(systemKey).isPresent();
    }

    /** "38", "W32 / L32", "Standart"; null when the pair is unknown. */
    public String label(String systemKey, String valueKey) {
        return find(systemKey).flatMap(s -> s.value(valueKey)).map(SizeValue::label).orElse(null);
    }
}
