package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedEventListener {

    private final PaymentCompletedHandlerRegistry handlerRegistry;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentMapper paymentMapper;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        Payment payment = event.getPayment();
        PaymentCompletedHandleResult handleResult = handlerRegistry.handle(payment);

        PaymentDto paymentDto = paymentMapper.toDto(payment);

        // Notify Sender (fromUser) if exists and it's not a self-payment already handled
        User sender = payment.getFromUser();
        if (sender != null) {
            paymentNotificationService.sendPaymentSuccessNotification(sender, paymentDto);
            log.info("Payment success notification sent to sender (fromUser) ID: {}", sender.getId());
        }

        // Notify Receiver (toUser) if exists and it's different from sender
        User receiver = payment.getToUser();
        if (receiver != null && (sender == null || !receiver.getId().equals(sender.getId()))) {
            paymentNotificationService.sendPaymentSuccessNotification(receiver, paymentDto);
            log.info("Payment success notification sent to receiver (toUser) ID: {}", receiver.getId());
        }
    }
}




