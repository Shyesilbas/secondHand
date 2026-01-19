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
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartReservationScheduler {

    private final CartRepository cartRepository;
    private final CartConfig cartConfig;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanupExpiredReservations() {
        if (!cartConfig.getReservation().isEnabled()) {
            return;
        }

        LocalDateTime expirationTime = LocalDateTime.now()
                .minus(cartConfig.getReservation().getTimeoutMinutes());

        List<Cart> expiredCarts = cartRepository.findExpiredReservations(expirationTime);

        if (expiredCarts.isEmpty()) {
            return;
        }

        log.info("Cleaning up {} expired cart reservations", expiredCarts.size());

        for (Cart cart : expiredCarts) {
            cart.setReservedAt(null);
            cartRepository.save(cart);
            log.debug("Released reservation for cart item: {} - listing: {}", 
                    cart.getId(), cart.getListing().getId());
        }

        log.info("Successfully cleaned up {} expired cart reservations", expiredCarts.size());
    }
}
