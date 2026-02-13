package com.serhat.secondhand.cart.service;

import com.serhat.secondhand.cart.config.CartConfig;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartReservationScheduler {

    private final CartRepository cartRepository;
    private final CartConfig cartConfig;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredReservations() {
        if (!cartConfig.getReservation().isEnabled()) {
            return;
        }

        List<Cart> expired = cartRepository.findExpiredReservations(LocalDateTime.now(ZoneId.of("Europe/Istanbul")));
        if (expired.isEmpty()) return;

        log.info("Removing {} expired cart reservations", expired.size());
        for (Cart cart : expired) {
            cartRepository.delete(cart);
            log.debug("Removed expired reservation: cart {} listing {}", cart.getId(), cart.getListing().getId());
        }
    }
}
