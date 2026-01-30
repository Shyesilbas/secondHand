package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedRunnerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/seeds")
public class AdminSeedController {

    private final SeedRunnerService seedRunnerService;

    public AdminSeedController(SeedRunnerService seedRunnerService) {
        this.seedRunnerService = seedRunnerService;
    }

    @GetMapping
    public Map<String, Object> list() {
        return seedRunnerService.listTasks();
    }

    @PostMapping("/{key}")
    public Result<Void> run(@PathVariable String key) {
        return seedRunnerService.run(key);
    }

    @PostMapping
    public Map<String, Result<Void>> runMany(@RequestBody(required = false) List<String> keys) {
        if (keys == null || keys.isEmpty()) {
            return seedRunnerService.runAll();
        }
        return seedRunnerService.runMany(keys);
    }
}

