package com.serhat.secondhand.listing.application.generator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local-only seed ({@code --app.seed=listings-clean}): removes the listings recorded in {@code generated_listings}.
 * A listing someone already interacted with (cart, favorite, offer, chat, order, payment, complaint, showcase) is
 * only soft-deleted so that data stays consistent; the rest is hard-deleted with its views, price history and
 * inventory.
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
class GeneratedListingCleanupTask implements SeedTask {

    /** Tables whose rows mean a real user touched the listing. */
    private static final List<String> INTERACTION_TABLES = List.of(
            "carts", "chat_rooms", "complaints", "escrows", "favorite_list_items", "favorites", "offers",
            "order_items", "payment", "showcases");
    private static final List<String> SUBTYPE_TABLES = List.of("vehicle_listings", "electronic_listings", "real_estate_listings", "books_listings",
            "clothing_listings");

    private final JdbcTemplate jdbcTemplate;
    private final CacheManager cacheManager;

    @Override
    public String key() {
        return "listings-clean";
    }

    @Override
    public Result<Void> run() {
        jdbcTemplate.execute("CREATE TEMP TABLE gen_touched ON COMMIT DROP AS SELECT listing_id FROM generated_listings g WHERE false");
        for (String table : INTERACTION_TABLES) {
            jdbcTemplate.update("INSERT INTO gen_touched SELECT g.listing_id FROM generated_listings g WHERE EXISTS "
                    + "(SELECT 1 FROM " + table + " t WHERE t.listing_id::text = g.listing_id::text)");
        }
        int softDeleted = jdbcTemplate.update("""
                UPDATE listings SET status = 'DELETED', updated_at = now()
                WHERE id IN (SELECT listing_id FROM gen_touched) AND status <> 'DELETED'
                """);
        String untouched = "SELECT listing_id FROM generated_listings WHERE listing_id NOT IN (SELECT listing_id FROM gen_touched)";
        jdbcTemplate.update("DELETE FROM listing_views WHERE listing_id IN (" + untouched + ")");
        jdbcTemplate.update("DELETE FROM price_history WHERE listing_id IN (" + untouched + ")");
        jdbcTemplate.update("DELETE FROM inventory WHERE listing_id IN (" + untouched + ")");
        for (String table : SUBTYPE_TABLES) {
            jdbcTemplate.update("DELETE FROM " + table + " WHERE id IN (" + untouched + ")");
        }
        // generated_listings rows go with the listing (ON DELETE CASCADE).
        int hardDeleted = jdbcTemplate.update("DELETE FROM listings WHERE id IN (" + untouched + ")");
        clearCache("listing:userListings");
        clearCache("user:profile");
        log.info("Generated listing cleanup: {} hard-deleted, {} soft-deleted (had interactions)", hardDeleted, softDeleted);
        return Result.success();
    }

    private void clearCache(String name) {
        Cache cache = cacheManager.getCache(name);
        if (cache != null) cache.clear();
    }
}
