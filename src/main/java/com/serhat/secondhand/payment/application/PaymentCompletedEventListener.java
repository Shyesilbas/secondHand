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

        User user = payment.getFromUser();
        if (user == null) {
            log.warn("Payment {} has no fromUser. Skipping payment success notification.", payment.getId());
            return;
        }

        PaymentDto paymentDto = paymentMapper.toDto(payment);
        paymentNotificationService.sendPaymentSuccessNotification(user, paymentDto);
        log.info("Payment success email sent for payment ID: {}", payment.getId());
    }
}




