package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailMetrics {

    private final MeterRegistry meterRegistry;

    public void recordSuccess(EmailType type) {
        meterRegistry.counter("email.sent", "type", type.name()).increment();
    }

    public void recordFailure(EmailType type, String error) {
        meterRegistry.counter("email.failed", "type", type.name(), "error", error != null ? error : "unknown").increment();
    }
}
