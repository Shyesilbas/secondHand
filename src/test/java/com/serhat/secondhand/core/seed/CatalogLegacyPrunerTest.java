package com.serhat.secondhand.core.seed;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CatalogLegacyPrunerTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final CatalogLegacyPruner pruner = new CatalogLegacyPruner(jdbc);

    private final UUID kept = UUID.randomUUID();
    private final UUID unused = UUID.randomUUID();
    private final UUID inUse = UUID.randomUUID();

    @SuppressWarnings("unchecked")
    private void stubRows() {
        when(jdbc.queryForList(anyString(), eq("clothing_brands")))
                .thenReturn(List.of(Map.of("tbl", "clothing_listings", "col", "brand_id")));
        when(jdbc.queryForList("SELECT id, name, label FROM clothing_brands")).thenReturn(List.of(
                Map.of("id", kept, "name", "ZARA", "label", "Zara"),
                Map.of("id", unused, "name", "BTWIN", "label", "B'Twin"),
                Map.of("id", inUse, "name", "SIMOND", "label", "Simond")));
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(unused))).thenReturn(null);
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(inUse))).thenReturn(1);
        when(jdbc.update(anyString(), any(Object.class))).thenReturn(1);
    }

    @Test
    void deletesOnlyUnreferencedRowsMissingFromCatalog() {
        stubRows();

        assertEquals(1, pruner.prune("clothing_brands", Set.of("zara")));

        verify(jdbc).update("DELETE FROM clothing_brands WHERE id = ?", unused);
        verify(jdbc, never()).update("DELETE FROM clothing_brands WHERE id = ?", inUse);
        verify(jdbc, never()).update("DELETE FROM clothing_brands WHERE id = ?", kept);
    }

    @Test
    @SuppressWarnings("unchecked")
    void mergesReferencedLegacyRowIntoCatalogDuplicateWithSameText() {
        UUID legacy = UUID.randomUUID();
        when(jdbc.queryForList(anyString(), eq("book_languages")))
                .thenReturn(List.of(Map.of("tbl", "book_listings", "col", "language_id")));
        when(jdbc.queryForList("SELECT id, name, label FROM book_languages")).thenReturn(List.of(
                Map.of("id", kept, "name", "TURKISH", "label", "Türkçe"),
                Map.of("id", legacy, "name", "TURKCE", "label", "Türkçe")));
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(legacy))).thenReturn(1);
        when(jdbc.update(anyString(), any(Object.class))).thenReturn(1);
        when(jdbc.update(anyString(), any(Object.class), any(Object.class))).thenReturn(1);

        assertEquals(1, pruner.prune("book_languages", Set.of("TURKISH")));

        verify(jdbc).update("UPDATE book_listings SET \"language_id\" = ? WHERE \"language_id\" = ?", kept, legacy);
        verify(jdbc).update("DELETE FROM book_languages WHERE id = ?", legacy);
    }

    @Test
    void refusesEmptyKeepSet() {
        assertThrows(IllegalStateException.class, () -> pruner.prune("clothing_brands", Set.of()));
    }
}
