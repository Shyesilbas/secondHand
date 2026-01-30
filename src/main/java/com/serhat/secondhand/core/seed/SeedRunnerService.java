package com.serhat.secondhand.core.seed;

import com.serhat.secondhand.core.result.Result;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SeedRunnerService {

    private final Map<String, SeedTask> tasksByKey;

    public SeedRunnerService(List<SeedTask> tasks) {
        Map<String, SeedTask> map = new LinkedHashMap<>();
        if (tasks != null) {
            for (SeedTask t : tasks) {
                if (t == null || t.key() == null || t.key().isBlank()) {
                    continue;
                }
                map.put(normalizeKey(t.key()), t);
            }
        }
        this.tasksByKey = Map.copyOf(map);
    }

    public Map<String, Object> listTasks() {
        return new LinkedHashMap<>(tasksByKey.keySet().stream().collect(LinkedHashMap::new, (m, k) -> m.put(k, true), Map::putAll));
    }

    public Result<Void> run(String key) {
        if (key == null || key.isBlank()) {
            return Result.error("Seed key is required", "SEED_KEY_REQUIRED");
        }
        SeedTask task = tasksByKey.get(normalizeKey(key));
        if (task == null) {
            return Result.error("Unknown seed key: " + key, "SEED_KEY_NOT_FOUND");
        }
        return task.run();
    }

    public Map<String, Result<Void>> runAll() {
        Map<String, Result<Void>> results = new LinkedHashMap<>();
        for (Map.Entry<String, SeedTask> e : tasksByKey.entrySet()) {
            Result<Void> r;
            try {
                r = e.getValue().run();
            } catch (Exception ex) {
                r = Result.error(ex.getMessage() != null ? ex.getMessage() : "Seed failed", "SEED_FAILED");
            }
            results.put(e.getKey(), r);
        }
        return results;
    }

    public Map<String, Result<Void>> runMany(List<String> keys) {
        Map<String, Result<Void>> results = new LinkedHashMap<>();
        if (keys == null || keys.isEmpty()) {
            return results;
        }
        for (String k : keys) {
            results.put(k, run(k));
        }
        return results;
    }

    private String normalizeKey(String key) {
        return key.trim().toLowerCase(Locale.ROOT);
    }
}

