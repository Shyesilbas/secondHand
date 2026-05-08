package com.serhat.secondhand.payment.outbox;

import com.serhat.secondhand.payment.application.PaymentCompletionDispatcher;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentOutboxWorker {

    private final PaymentOutboxRepository paymentOutboxRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentCompletionDispatcher paymentCompletionDispatcher;

    @Lazy
    @Autowired
    private PaymentOutboxWorker self;

    @org.springframework.scheduling.annotation.Scheduled(
            fixedDelayString = "${app.payment.outbox.fixed-delay-ms:5000}",
            initialDelayString = "${app.payment.outbox.initial-delay-ms:5000}"
    )
    @Transactional
    public void processPendingEvents() {
        List<PaymentOutboxEvent> events = paymentOutboxRepository
                .findByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(
                        List.of(OutboxStatus.PENDING, OutboxStatus.FAILED),
                        LocalDateTime.now(),
                        PageRequest.of(0, 50)
                );

        for (PaymentOutboxEvent event : events) {
            self.processEvent(event.getId());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processEvent(UUID eventId) {
        PaymentOutboxEvent event = paymentOutboxRepository.findById(eventId).orElse(null);
        if (event == null || event.getStatus() == OutboxStatus.PROCESSED) {
            return;
        }

        try {
            event.setStatus(OutboxStatus.PROCESSING);
            paymentOutboxRepository.save(event);

            UUID paymentId = UUID.fromString(event.getPayload());
            Payment payment = paymentRepository.findById(paymentId).orElseThrow();
            paymentCompletionDispatcher.dispatch(payment);

            event.setStatus(OutboxStatus.PROCESSED);
            event.setProcessedAt(LocalDateTime.now());
            event.setLastError(null);
            paymentOutboxRepository.save(event);
        } catch (Exception ex) {
            int newAttempt = event.getAttemptCount() + 1;
            event.setAttemptCount(newAttempt);
            event.setLastError(ex.getMessage());
            event.setNextAttemptAt(LocalDateTime.now().plusSeconds(Math.min(300, newAttempt * 10L)));
            event.setStatus(newAttempt >= event.getMaxAttempts() ? OutboxStatus.FAILED : OutboxStatus.PENDING);
            paymentOutboxRepository.save(event);
            log.error("Payment outbox processing failed for event {}", eventId, ex);
        }
    }
}
