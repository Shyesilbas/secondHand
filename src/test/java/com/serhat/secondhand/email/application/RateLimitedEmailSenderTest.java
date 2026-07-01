package com.serhat.secondhand.email.application;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RateLimitedEmailSenderTest {

    @Test
    void acquire_ShouldWorkInstantly_WithinInitialTokens() {
        RateLimitedEmailSender sender = new RateLimitedEmailSender();
        
        long start = System.currentTimeMillis();

        // Acquirings up to 10 tokens should be almost instant (initial capacity is 10 tokens)
        for (int i = 0; i < 5; i++) {
            sender.acquire();
        }

        assertTrue((System.currentTimeMillis() - start) < 150, "Initial token acquisitions should be instant");
    }
}
