package com.serhat.secondhand.dashboard.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DateRangeHelper {

    public LocalDateTime normalizeEndDate(LocalDateTime endDate) {
        if (endDate == null) {
            return LocalDateTime.now();
        }
        return endDate.toLocalDate().atTime(LocalTime.MAX);
    }

    public LocalDateTime normalizeStartDate(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            return endDate.toLocalDate().minusDays(30).atStartOfDay();
        }
        return startDate.toLocalDate().atStartOfDay();
    }
}
