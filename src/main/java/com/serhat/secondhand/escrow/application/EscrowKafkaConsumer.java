package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.user.application.SystemAccountService;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowKafkaConsumer {

    private final IEWalletService walletService;
    private final UserRepository userRepository;
    private final SystemAccountService systemAccountService;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @KafkaListener(
            topics = EscrowKafkaProducer.ESCROW_RELEASED_TOPIC,
            groupId = "${app.kafka.consumer.escrow-released-group:escrow-released-consumers}"
    )
    @Transactional
    public void consumeEscrowReleased(EscrowReleasedKafkaEvent event) {
        log.info("Received EscrowReleasedKafkaEvent from Kafka: escrowId={}, orderNumber={}, sellerId={}, amount={}",
                event.escrowId(), event.orderNumber(), event.sellerId(), event.amount());

        // Eksik alanlı veya satıcısı bulunamayan event atlanmaz: exception dedupe kaydını geri alır,
        // DefaultErrorHandler yeniden dener ve event escrow.released.v1.DLT'ye düşer; para sessizce kaybolmaz.
        if (event.escrowId() == null || event.sellerId() == null || event.amount() == null) {
            log.error("EscrowReleasedKafkaEvent is missing required fields: escrowId={}, sellerId={}, amount={}",
                    event.escrowId(), event.sellerId(), event.amount());
            throw new BusinessException(PaymentErrorCodes.ESCROW_RELEASE_EVENT_INVALID);
        }

        // Atomic DB-Level Idempotency Check: INSERT ON CONFLICT DO NOTHING within the same ACID Transaction
        String dedupeKey = "escrow:release:" + event.escrowId();
        int inserted = processedKafkaEventRepository.insertIfNotExists(dedupeKey, "escrow-released-consumers");
        if (inserted == 0) {
            log.warn("Duplicate EscrowReleasedKafkaEvent detected for escrowId: {}. Skipping duplicate wallet credit.", event.escrowId());
            return;
        }

        try {
            User seller = userRepository.findById(event.sellerId()).orElseThrow(() -> {
                log.error("Seller with ID {} not found for escrow release credit (escrowId: {}).",
                        event.sellerId(), event.escrowId());
                return new BusinessException(PaymentErrorCodes.ESCROW_RELEASE_SELLER_NOT_FOUND);
            });
            walletService.creditWalletQuietly(seller, event.amount());
            settleSystemAccount(event);
            log.info("Successfully credited {} to seller {} wallet asynchronously via Kafka.",
                    event.amount(), seller.getEmail());
        } catch (RuntimeException ex) {
            log.error("Failed to credit seller wallet for escrowId: {}, sellerId: {}",
                    event.escrowId(), event.sellerId(), ex);
            throw ex;
        }
    }

    /**
     * The platform funds the coupon share and keeps the commission: the system account is credited the
     * commission and debited the coupon subsidy in one signed move. It may go negative; the payout never waits for it.
     */
    private void settleSystemAccount(EscrowReleasedKafkaEvent event) {
        java.math.BigDecimal commission = event.commissionAmount() != null ? event.commissionAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal subsidy = event.platformSubsidy() != null ? event.platformSubsidy() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal shipping = event.shippingDeduction() != null ? event.shippingDeduction() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal net = commission.add(shipping).subtract(subsidy);
        if (net.signum() != 0) {
            walletService.creditWalletQuietly(systemAccountService.getSystemUser(), net);
            log.info("System account settled {} for escrowId={} (commission {}, shipping {}, coupon subsidy {}).",
                    net, event.escrowId(), commission, shipping, subsidy);
        }
    }
}
