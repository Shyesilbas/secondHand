package com.serhat.secondhand.core.seed;

import com.serhat.secondhand.core.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Runs catalog seeds only when explicitly requested.
 *
 * <p>Examples:
 * <pre>
 *   ./mvnw spring-boot:run -Dspring-boot.run.arguments=--app.seed=vehicle,electronics
 *   APP_SEED=all ./mvnw spring-boot:run
 * </pre>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogSeedStartupRunner implements ApplicationRunner {

    private static final String ALL = "all";
    private static final String LISTING = "listing";
    private static final Set<String> LISTING_SEEDS = Set.of(
            "vehicle",
            "electronics",
            "clothing",
            "books",
            "sports",
            "realestate"
    );

    private final List<SeedTask> seedTasks;

    @Value("${app.seed:${APP_SEED:}}")
    private String requestedSeeds;

    @Override
    public void run(ApplicationArguments args) {
        Set<String> requested = parseRequestedSeeds(requestedSeeds);
        if (requested.isEmpty()) {
            log.info("Catalog seed startup runner skipped. Set --app.seed=<key[,key]> or APP_SEED=all to run seeds.");
            return;
        }

        Map<String, SeedTask> tasksByKey = seedTasks.stream()
                .collect(Collectors.toMap(
                        task -> normalize(task.key()),
                        task -> task,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        requested = expandGroups(requested, tasksByKey.keySet());

        Set<String> unknown = requested.stream()
                .filter(key -> !tasksByKey.containsKey(key))
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        if (!unknown.isEmpty()) {
            throw new IllegalArgumentException("Unknown seed key(s): " + unknown + ". Available seeds: " + tasksByKey.keySet());
        }

        for (String key : requested) {
            SeedTask task = tasksByKey.get(key);
            log.info("Running catalog seed: {}", key);
            Result<Void> result = task.run();
            if (result == null || result.isError()) {
                String message = result != null ? result.getMessage() : "Seed returned null result";
                String code = result != null ? result.getErrorCode() : "SEED_RESULT_MISSING";
                throw new IllegalStateException("Catalog seed failed [" + key + "/" + code + "]: " + message);
            }
            log.info("Catalog seed completed: {}", key);
        }
    }

    private Set<String> parseRequestedSeeds(String raw) {
        if (raw == null || raw.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(raw.split(","))
                .map(this::normalize)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private Set<String> expandGroups(Set<String> requested, Set<String> availableSeeds) {
        java.util.LinkedHashSet<String> expanded = new java.util.LinkedHashSet<>();
        for (String seed : requested) {
            if (ALL.equals(seed)) {
                expanded.addAll(availableSeeds);
            } else if (LISTING.equals(seed)) {
                expanded.addAll(LISTING_SEEDS);
            } else {
                expanded.add(seed);
            }
        }
        return expanded;
    }
}
