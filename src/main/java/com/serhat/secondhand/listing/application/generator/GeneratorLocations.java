package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Cities and districts from {@code data/common/locations.json}, picked roughly in proportion to population. */
final class GeneratorLocations {

    record Place(String cityKey, String cityLabel, String districtKey, String districtLabel, String neighborhoodKey) {
    }

    private record District(String key, String label, List<String> neighborhoods) {
    }

    private record City(String key, String label, List<District> districts) {
    }

    // Large cities by approximate share of listings; every other city gets weight 1.
    private static final Map<String, Integer> CITY_WEIGHTS = Map.ofEntries(
            Map.entry("ISTANBUL", 30), Map.entry("ANKARA", 11), Map.entry("IZMIR", 9), Map.entry("BURSA", 5),
            Map.entry("ANTALYA", 5), Map.entry("KOCAELI", 4), Map.entry("KONYA", 3), Map.entry("ADANA", 3),
            Map.entry("GAZIANTEP", 3), Map.entry("MERSIN", 2), Map.entry("KAYSERI", 2), Map.entry("ESKISEHIR", 2),
            Map.entry("SAMSUN", 2), Map.entry("TEKIRDAG", 2), Map.entry("SAKARYA", 2), Map.entry("DENIZLI", 2),
            Map.entry("MUGLA", 2), Map.entry("MANISA", 2), Map.entry("TRABZON", 2), Map.entry("DIYARBAKIR", 2));

    private final Map<City, Integer> weights = new LinkedHashMap<>();

    GeneratorLocations(ObjectMapper objectMapper) {
        JsonNode root;
        try (InputStream is = new ClassPathResource("data/common/locations.json").getInputStream()) {
            root = objectMapper.readTree(is);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read data/common/locations.json", e);
        }
        for (JsonNode c : root.path("cities")) {
            List<District> districts = new ArrayList<>();
            for (JsonNode d : c.path("districts")) {
                List<String> neighborhoods = new ArrayList<>();
                d.path("neighborhoods").forEach(n -> neighborhoods.add(n.path("key").asText()));
                districts.add(new District(d.path("key").asText(), d.path("label").asText(), neighborhoods));
            }
            if (!districts.isEmpty()) {
                City city = new City(c.path("key").asText(), c.path("label").asText(), districts);
                weights.put(city, CITY_WEIGHTS.getOrDefault(city.key(), 1));
            }
        }
        if (weights.isEmpty()) {
            throw new IllegalStateException("data/common/locations.json has no cities with districts");
        }
    }

    Place pick(GeneratorRandom random) {
        City city = random.weighted(weights);
        District district = random.pick(city.districts());
        String neighborhood = district.neighborhoods().isEmpty() ? null : random.pick(district.neighborhoods());
        return new Place(city.key(), city.label(), district.key(), district.label(), neighborhood);
    }
}
