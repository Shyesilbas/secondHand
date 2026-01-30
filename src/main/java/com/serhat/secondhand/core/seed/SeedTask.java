package com.serhat.secondhand.core.seed;

import com.serhat.secondhand.core.result.Result;

public interface SeedTask {
    String key();
    Result<Void> run();
}

