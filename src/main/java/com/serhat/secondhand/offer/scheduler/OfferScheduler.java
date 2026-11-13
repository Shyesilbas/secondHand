package com.serhat.secondhand.offer.scheduler;

import com.serhat.secondhand.offer.application.OfferStockHoldService;
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

/**
 * Expires PENDING offers past their response deadline and ACCEPTED offers past their payment deadline.
 * Without the ACCEPTED case an unpaid accepted offer would block every further accept on its listing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OfferScheduler {

    private final OfferRepository offerRepository;
    private final OfferEmailNotificationService notificationService;
    private final OfferStockHoldService offerStockHoldService;

    @Scheduled(cron = "${app.offer.scheduler-cron:0 * * * * *}")
    @Transactional
    public void checkExpiredOffers() {
        LocalDateTime now = LocalDateTime.now();
        List<Offer> overdueOffers = offerRepository.findAllByStatusInAndExpiresAtBefore(OfferStatus.EXPIRABLE, now);
        if (overdueOffers.isEmpty()) return;

        int expired = 0;
        for (Offer offer : overdueOffers) {
            // Conditional UPDATE per offer: an offer completed by checkout in the meantime is skipped, not overwritten.
            if (offerRepository.expireIfOverdue(offer.getId(), offer.getVersion(), OfferStatus.EXPIRABLE, now) == 1) {
                if (offer.getStatus() == OfferStatus.ACCEPTED) {
                    // The unpaid offer's stock hold goes back to the pool once the expiry commits.
                    offerStockHoldService.releaseAfterCommit(offer);
                }
                notificationService.notifyExpiredToBoth(offer);
                expired++;
            } else {
                log.info("Offer {} changed before expiry (status {}); skipped", offer.getId(), offer.getStatus());
            }
        }
        log.info("Expired {} of {} overdue offers", expired, overdueOffers.size());
    }
}
