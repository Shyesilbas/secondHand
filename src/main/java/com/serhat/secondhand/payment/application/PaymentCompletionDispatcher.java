package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletionDispatcher {

    private final PaymentCompletedHandlerRegistry handlerRegistry;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentMapper paymentMapper;

    public void dispatch(Payment payment) {
        handlerRegistry.handle(payment);

        PaymentDto paymentDto = paymentMapper.toDto(payment);

        User sender = payment.getFromUser();
        if (sender != null) {
            paymentNotificationService.sendPaymentSuccessNotification(sender, paymentDto);
            log.info("Payment success notification sent to sender ID: {}", sender.getId());
        }

        User receiver = payment.getToUser();
        if (receiver != null && (sender == null || !receiver.getId().equals(sender.getId()))) {
            paymentNotificationService.sendPaymentSuccessNotification(receiver, paymentDto);
            log.info("Payment success notification sent to receiver ID: {}", receiver.getId());
        }
    }
}
