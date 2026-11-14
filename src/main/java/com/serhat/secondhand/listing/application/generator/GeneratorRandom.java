package com.serhat.secondhand.listing.application.generator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/** Seeded randomness for the listing generator, so a run with the same seed produces the same listings. */
final class GeneratorRandom {

    private final Random random;

    GeneratorRandom(long seed) {
        this.random = new Random(seed);
    }

    double between(double min, double max) {
        return min + random.nextDouble() * (max - min);
    }

    int between(int min, int maxInclusive) {
        return min + random.nextInt(maxInclusive - min + 1);
    }

    boolean chance(double probability) {
        return random.nextDouble() < probability;
    }

    <T> T pick(List<T> items) {
        return items.get(random.nextInt(items.size()));
    }

    /** Picks a key with probability proportional to its weight. */
    <T> T weighted(Map<T, Integer> weights) {
        int total = weights.values().stream().mapToInt(Integer::intValue).sum();
        int roll = random.nextInt(total);
        for (Map.Entry<T, Integer> e : weights.entrySet()) {
            roll -= e.getValue();
            if (roll < 0) return e.getKey();
        }
        throw new IllegalStateException("weights are empty");
    }

    /** Index skewed towards the start of a list of {@code size} (cheaper variants are listed more often). */
    int skewedIndex(int size) {
        double r = random.nextDouble();
        return Math.min(size - 1, (int) Math.floor(r * r * size));
    }

    /** Rounds an asking price the way sellers write it. */
    static BigDecimal roundPrice(double price) {
        double step = price >= 1_000_000 ? 5_000 : price >= 100_000 ? 1_000 : price >= 10_000 ? 250 : 50;
        return BigDecimal.valueOf(Math.max(step, Math.round(price / step) * step)).setScale(2, RoundingMode.UNNECESSARY);
    }

    /** Insertion-ordered weight map (deterministic across JVM runs, unlike Map.of). */
    @SuppressWarnings("unchecked")
    static <T> Map<T, Integer> weights(Object... keyWeightPairs) {
        Map<T, Integer> map = new LinkedHashMap<>();
        for (int i = 0; i < keyWeightPairs.length; i += 2) {
            map.put((T) keyWeightPairs[i], (Integer) keyWeightPairs[i + 1]);
        }
        return map;
    }
}
