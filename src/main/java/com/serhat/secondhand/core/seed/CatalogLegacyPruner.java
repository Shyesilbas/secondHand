package com.serhat.secondhand.core.seed;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Seeds are upsert-only, so rows dropped from a catalog JSON would otherwise stay in the
 * database and keep showing up in {@code /enums/all}. This removes such rows, but only when
 * no foreign key anywhere points at them.
 *
 * <p>A legacy row that is still referenced is kept by default. Merging it into the catalog row it
 * duplicates (same displayed text, or an explicit alias) repoints listing foreign keys, which is a
 * data migration, so it only happens with {@code app.seed.merge-legacy-duplicates=true}. Runs inside
 * the seed task's transaction: a failed repoint fails the seed and nothing is half-moved.
 */
@Component
@Slf4j
public class CatalogLegacyPruner {

    private static final String FK_REFERENCES_SQL = """
            SELECT c.conrelid::regclass::text AS tbl, a.attname AS col
            FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
            WHERE c.contype = 'f' AND c.confrelid = ?::regclass
            """;

    private final JdbcTemplate jdbc;
    private final boolean mergeLegacyDuplicates;

    public CatalogLegacyPruner(JdbcTemplate jdbc,
                               @Value("${app.seed.merge-legacy-duplicates:false}") boolean mergeLegacyDuplicates) {
        this.jdbc = jdbc;
        this.mergeLegacyDuplicates = mergeLegacyDuplicates;
    }

    public int prune(String table, Collection<String> keepNames) {
        return prune(table, keepNames, Map.of());
    }

    /**
     * @param aliases legacy name to catalog name, for duplicates whose text differs
     * @return number of deleted rows
     */
    public int prune(String table, Collection<String> keepNames, Map<String, String> aliases) {
        if (keepNames == null || keepNames.isEmpty()) {
            throw new IllegalStateException("Refusing to prune " + table + " with an empty keep set");
        }
        Set<String> keep = keepNames.stream().map(CatalogLegacyPruner::upper).collect(Collectors.toSet());
        List<Map<String, Object>> refs = jdbc.queryForList(FK_REFERENCES_SQL, table);
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT id, name, label FROM " + table);

        Map<String, Object> keptByName = new HashMap<>();
        Map<String, Object> keptByText = new HashMap<>();
        for (Map<String, Object> row : rows) {
            if (keep.contains(upper(row.get("name")))) {
                keptByName.put(upper(row.get("name")), row.get("id"));
                keptByText.putIfAbsent(text(row), row.get("id"));
            }
        }

        int deleted = 0;
        for (Map<String, Object> row : rows) {
            String name = String.valueOf(row.get("name"));
            if (keep.contains(upper(name))) continue;

            if (isReferenced(refs, row.get("id"))) {
                Object target = keptByName.get(upper(aliases.get(name)));
                if (target == null) target = keptByText.get(text(row));
                if (target == null) continue;
                if (!mergeLegacyDuplicates) {
                    log.warn("Keeping referenced legacy {} row '{}'; set app.seed.merge-legacy-duplicates=true to merge it", table, name);
                    continue;
                }
                repoint(refs, row.get("id"), target);
                log.info("Merged legacy {} row '{}' into its catalog duplicate", table, name);
            }
            deleted += jdbc.update("DELETE FROM " + table + " WHERE id = ?", row.get("id"));
            log.debug("Pruned legacy {} row: {}", table, name);
        }
        if (deleted > 0) {
            log.info("Pruned {} legacy row(s) from {}", deleted, table);
        }
        return deleted;
    }

    private boolean isReferenced(List<Map<String, Object>> refs, Object id) {
        for (Map<String, Object> ref : refs) {
            Integer hit = jdbc.query(
                    "SELECT 1 FROM " + ref.get("tbl") + " WHERE \"" + ref.get("col") + "\" = ? LIMIT 1",
                    rs -> rs.next() ? 1 : null, id);
            if (hit != null) return true;
        }
        return false;
    }

    private void repoint(List<Map<String, Object>> refs, Object from, Object to) {
        for (Map<String, Object> ref : refs) {
            jdbc.update("UPDATE " + ref.get("tbl") + " SET \"" + ref.get("col") + "\" = ? WHERE \"" + ref.get("col") + "\" = ?", to, from);
        }
    }

    private static String text(Map<String, Object> row) {
        Object label = row.get("label");
        String shown = label == null || String.valueOf(label).isBlank() ? String.valueOf(row.get("name")) : String.valueOf(label);
        return shown.trim().toLowerCase(Locale.ROOT);
    }

    private static String upper(Object value) {
        return value == null ? "" : String.valueOf(value).toUpperCase(Locale.ROOT);
    }
}
