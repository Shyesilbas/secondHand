package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.order.outbox.OrderOutboxRepository;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Outbox tablolarında ve tüketilen Kafka idempotency tablolarında biriken
 * başarıyla tamamlanmış (PROCESSED) eski kayıtları periyodik olarak temizleyen
 * Housekeeping (Purge) Scheduler servisi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxHousekeepingScheduler {

    private final PaymentOutboxRepository paymentOutboxRepository;
    private final OrderOutboxRepository orderOutboxRepository;
    private final EscrowOutboxRepository escrowOutboxRepository;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @Value("${app.outbox.cleanup.retention-days:3}")
    private int retentionDays;

    @Scheduled(cron = "${app.outbox.cleanup.cron:0 0 3 * * ?}")
    @Transactional
    public void purgeProcessedOutboxEvents() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        log.info("Starting Outbox & Idempotency Housekeeping purge for records older than {} days (cutoff: {})...", retentionDays, cutoff);

        try {
            int deletedPaymentEvents = paymentOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
            int deletedOrderEvents = orderOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
            int deletedEscrowEvents = escrowOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
            int deletedIdempotencyKeys = processedKafkaEventRepository.deleteByProcessedAtBefore(cutoff);

            log.info("Outbox Housekeeping completed successfully. Purged counts -> Payment: {}, Order: {}, Escrow: {}, ProcessedKafkaKeys: {}",
                    deletedPaymentEvents, deletedOrderEvents, deletedEscrowEvents, deletedIdempotencyKeys);
        } catch (Exception ex) {
            log.error("Outbox Housekeeping purge failed!", ex);
        }
    }
}
