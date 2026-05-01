package com.serhat.secondhand.cart.application;

import com.serhat.secondhand.cart.config.CartConfig;
import com.serhat.secondhand.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartReservationScheduler {

    private final CartRepository cartRepository;
    private final CartConfig cartConfig;

    @Scheduled(fixedRateString = "${app.cart.scheduler.cleanup-fixed-rate-ms:60000}")
    @Transactional
    public void cleanupExpiredReservations() {
        if (!cartConfig.getReservation().isEnabled()) {
            return;
        }

        ZoneId zoneId = ZoneId.of(Optional.ofNullable(cartConfig.getZoneId()).orElse("Europe/Istanbul"));
        LocalDateTime now = LocalDateTime.now(zoneId);
        List<Long> expiredIds = cartRepository.findExpiredReservationIds(now);
        if (expiredIds.isEmpty()) return;

        log.info("Clearing {} expired cart reservations", expiredIds.size());
        cartRepository.clearReservationsByIdInBatch(expiredIds);
        log.debug("Expired reservations cleared in batch");
    }
}
