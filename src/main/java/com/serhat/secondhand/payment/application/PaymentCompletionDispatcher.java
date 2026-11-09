package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
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
        PaymentTransactionType txnType = payment.getTransactionType();
        boolean isSaleOrEscrowRelease = txnType == PaymentTransactionType.ITEM_PURCHASE
                || txnType == PaymentTransactionType.ITEM_SALE;

        if (!isSaleOrEscrowRelease) {
            handlerRegistry.handle(payment);
        }

        PaymentDto paymentDto = paymentMapper.toDto(payment);

        if (isSaleOrEscrowRelease) {
            User seller = payment.getToUser();
            if (seller != null) {
                PaymentDto sellerPaymentDto = new PaymentDto(
                        paymentDto.paymentId(),
                        paymentDto.senderDisplayName(),
                        paymentDto.receiverDisplayName(),
                        paymentDto.amount(),
                        paymentDto.currency(),
                        paymentDto.providerName(),
                        paymentDto.providerTransactionId(),
                        PaymentTransactionType.ITEM_SALE,
                        PaymentDirection.INCOMING,
                        paymentDto.listingId(),
                        paymentDto.listingTitle(),
                        paymentDto.listingNo(),
                        paymentDto.processedAt(),
                        paymentDto.status(),
                        paymentDto.isSuccess(),
                        paymentDto.description()
                );
                paymentNotificationService.sendPaymentSuccessNotification(seller, sellerPaymentDto);
                log.info("Escrow release / sale payment notification sent to seller ID: {}", seller.getId());
            }
            return;
        }

        User recipient = (txnType == PaymentTransactionType.REFUND && payment.getPaymentDirection() == PaymentDirection.INCOMING)
                ? payment.getToUser()
                : payment.getFromUser();
        if (recipient != null) {
            paymentNotificationService.sendPaymentSuccessNotification(recipient, paymentDto);
            log.info("Payment success notification sent to user ID: {}", recipient.getId());
        }
    }
}
