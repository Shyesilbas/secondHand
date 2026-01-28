package com.serhat.secondhand.offer.scheduler;

import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.offer.repository.OfferRepository;
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
public class OfferScheduler {

    private final OfferRepository offerRepository;
    private final OfferEmailNotificationService notificationService;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkExpiredOffers() {
        log.debug("Checking for expired offers...");

        List<Offer> expiredOffers = offerRepository.findAllByStatusAndExpiresAtBefore(
                OfferStatus.PENDING, LocalDateTime.now());

        if (expiredOffers.isEmpty()) return;

        log.info("Found {} expired offers. Updating status...", expiredOffers.size());

        expiredOffers.forEach(offer -> {
            offer.setStatus(OfferStatus.EXPIRED);
            notificationService.notifyExpiredToBoth(offer);
        });

        offerRepository.saveAll(expiredOffers);
    }
}