package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Local-only seed ({@code --app.seed=listings-generate}): creates realistic, already published vehicle,
 * electronics and real estate listings for the real (non-catalog) users, using estimated prices from
 * {@code data/listing-generator/prices.json}. Listings go through the normal create flow (validation, catalog
 * snapshot, inventory) but skip the listing-fee payment and the new-listing event, so no follower gets a
 * notification or e-mail. Every generated id is recorded in {@code generated_listings} for
 * {@code listings-clean}.
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
class ListingGeneratorSeedTask implements SeedTask {

    private static final String PRICES = "data/listing-generator/prices.json";
    private static final int SPREAD_DAYS = 120;

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final ListingRepository listingRepository;
    private final CacheManager cacheManager;
    private final VehicleListingGenerator vehicleGenerator;
    private final ElectronicListingGenerator electronicGenerator;
    private final RealEstateListingGenerator realEstateGenerator;

    @Value("${app.listing-generator.vehicles:200}")
    private int vehicleCount;

    @Value("${app.listing-generator.electronics:200}")
    private int electronicCount;

    @Value("${app.listing-generator.realestate:200}")
    private int realEstateCount;

    @Value("${app.listing-generator.seed:42}")
    private long seed;

    @Override
    public String key() {
        return "listings-generate";
    }

    @Override
    public Result<Void> run() {
        List<Long> sellers = jdbcTemplate.queryForList("""
                SELECT id FROM users WHERE acc_status = 'ACTIVE' AND email NOT LIKE '%@example.test' ORDER BY id
                """, Long.class);
        if (sellers.isEmpty()) {
            return Result.error("No active real users to generate listings for", "GENERATOR_NO_SELLERS");
        }
        GeneratorPrices prices = loadPrices();
        GeneratorRandom random = new GeneratorRandom(seed);
        GeneratorLocations locations = new GeneratorLocations(objectMapper);
        GeneratorPhotos photos = new GeneratorPhotos(objectMapper);
        String batch = "gen-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));

        var vehicles = vehicleCount > 0 ? vehicleGenerator.candidates(prices.vehicles()) : List.<VehicleListingGenerator.Candidate>of();
        var electronics = electronicCount > 0 ? electronicGenerator.candidates(prices.electronics()) : List.<ElectronicListingGenerator.Candidate>of();

        int n = 0;
        for (int i = 0; i < vehicleCount; i++, n++) {
            var candidate = random.pick(vehicles);
            UUID id = vehicleGenerator.create(candidate, sellers.get(n % sellers.size()), random, locations.pick(random),
                    photos.vehicle(candidate.price().generation()));
            finish(id, batch, random);
        }
        for (int i = 0; i < electronicCount; i++, n++) {
            var candidate = random.pick(electronics);
            UUID id = electronicGenerator.create(candidate, sellers.get(n % sellers.size()), random, locations.pick(random),
                    photos.electronic(candidate.price()));
            finish(id, batch, random);
        }
        if (realEstateCount > 0) {
            var realEstatePrices = realEstateGenerator.loadPrices();
            var catalog = realEstateGenerator.catalog();
            var cityWeights = realEstateGenerator.cityWeights(realEstatePrices);
            for (int i = 0; i < realEstateCount; i++, n++) {
                UUID id = realEstateGenerator.create(realEstatePrices, catalog, sellers.get(n % sellers.size()), random,
                        locations.pick(random, cityWeights));
                finish(id, batch, random);
            }
        }
        clearCache("listing:userListings");
        clearCache("user:profile");
        log.info("Listing generator batch {}: {} vehicle + {} electronics + {} real estate listings for {} sellers (prices {} {})",
                batch, vehicleCount, electronicCount, realEstateCount, sellers.size(), prices.source(), prices.priceDate());
        return Result.success();
    }

    /** Publishes without the fee payment or the follower event, records the id and backdates it. */
    private void finish(UUID id, String batch, GeneratorRandom random) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Generated listing " + id + " not found after create"));
        listing.markFeeAsPaid();
        listing.publish();
        listingRepository.saveAndFlush(listing);
        LocalDateTime created = LocalDateTime.now()
                .minusMinutes(random.between(30, SPREAD_DAYS * 24 * 60));
        jdbcTemplate.update("UPDATE listings SET created_at = ?, updated_at = ? WHERE id = ?",
                Timestamp.valueOf(created), Timestamp.valueOf(created), id);
        jdbcTemplate.update("INSERT INTO generated_listings (listing_id, batch) VALUES (?, ?)", id, batch);
    }

    private GeneratorPrices loadPrices() {
        GeneratorPrices prices;
        try (InputStream is = new ClassPathResource(PRICES).getInputStream()) {
            prices = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                    .readValue(is, GeneratorPrices.class);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + PRICES, e);
        }
        prices.vehicles().forEach(p -> checkRange(p.priceTry(), p.brand() + " " + p.model() + " " + p.generation()));
        prices.electronics().forEach(p -> checkRange(p.priceTry(), p.type() + " " + p.brand() + " " + p.model()));
        return prices;
    }

    private static void checkRange(List<Long> range, String name) {
        if (range == null || range.size() != 2 || range.get(0) <= 0 || range.get(0) > range.get(1)) {
            throw new IllegalStateException(PRICES + ": invalid priceTry " + range + " for " + name);
        }
    }

    private void clearCache(String name) {
        Cache cache = cacheManager.getCache(name);
        if (cache != null) cache.clear();
    }
}
