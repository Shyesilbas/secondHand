package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * {@code data/listing-generator/photos.json}: listing photos per vehicle generation name and per electronics
 * {@code TYPE|brand|model} key, already uploaded to Cloudinary. A photo's color (and official color name for
 * electronics) becomes the listing's color, so photo and listing never disagree. Models without photos get none.
 */
@Slf4j
final class GeneratorPhotos {

    private static final String FILE = "data/listing-generator/photos.json";

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Photo(String url, Color color, String colorName) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Pool(Map<String, List<Photo>> vehicles, Map<String, List<Photo>> electronics) {
    }

    private final Pool pool;

    GeneratorPhotos(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource(FILE);
        if (!resource.exists()) {
            log.warn("{} not found; generated listings will have no photos", FILE);
            this.pool = new Pool(Map.of(), Map.of());
            return;
        }
        try (InputStream is = resource.getInputStream()) {
            Pool read = objectMapper.readValue(is, Pool.class);
            this.pool = new Pool(read.vehicles() == null ? Map.of() : read.vehicles(),
                    read.electronics() == null ? Map.of() : read.electronics());
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + FILE, e);
        }
        pool.vehicles().forEach(GeneratorPhotos::check);
        pool.electronics().forEach(GeneratorPhotos::check);
    }

    private static void check(String key, List<Photo> photos) {
        for (Photo p : photos) {
            if (p.url() == null || !p.url().startsWith("https://")) {
                throw new IllegalStateException(FILE + ": photo without https url for " + key);
            }
        }
    }

    List<Photo> vehicle(String generationName) {
        return pool.vehicles().getOrDefault(generationName, List.of());
    }

    List<Photo> electronic(GeneratorPrices.ElectronicPrice price) {
        return pool.electronics().getOrDefault(price.type() + "|" + price.brand() + "|" + price.model(), List.of());
    }
}
