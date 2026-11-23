package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletionDispatcher {

    private final PaymentCompletedHandlerRegistry handlerRegistry;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentMapper paymentMapper;
    private final EscrowRepository escrowRepository;

    public void dispatch(Payment payment) {
        PaymentTransactionType txnType = payment.getTransactionType();
        if (txnType == PaymentTransactionType.SHIPPING_FEE) {
            // The order confirmation already tells the buyer about the cargo fee; no separate receipt.
            return;
        }
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
                        sellerReceivedAmount(payment, paymentDto.amount()),
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

    /** The seller receipt shows the payout: the buyer-paid amount plus the platform coupon share minus the commission. */
    private BigDecimal sellerReceivedAmount(Payment payment, BigDecimal paidAmount) {
        if (paidAmount == null || payment.getOrderItemId() == null) {
            return paidAmount;
        }
        return escrowRepository.findByOrderItemId(payment.getOrderItemId())
                .map(escrow -> paidAmount.add(escrow.getPlatformSubsidy()).subtract(escrow.getCommissionAmount()).subtract(escrow.getShippingDeduction()))
                .orElse(paidAmount);
    }
}
