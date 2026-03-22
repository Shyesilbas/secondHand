package com.serhat.secondhand.payment.orchestrator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EscrowRefundExecutor {

    private final IEWalletService eWalletService;
    private final OrderItemEscrowRepository orderItemEscrowRepository;

    public Result<Void> execute(List<OrderItemEscrow> escrows, User buyer) {
        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        BigDecimal totalRefundFromEscrow = BigDecimal.ZERO;
        BigDecimal totalRefundFromSeller = BigDecimal.ZERO;

        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
                log.debug("Escrow {} already refunded, skipping", escrow.getId());
                continue;
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
                log.warn("Cannot refund cancelled escrow {}", escrow.getId());
                return Result.error("Escrow is not refundable: " + escrow.getId(), "ESCROW_REFUND_INVALID_STATUS");
            }

            try {
                if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                    UUID listingId = escrow.getOrderItem().getListing().getId();
                    eWalletService.debitFromUser(
                            escrow.getSeller(),
                            escrow.getAmount(),
                            listingId,
                            PaymentTransactionType.REFUND
                    );
                    totalRefundFromSeller = totalRefundFromSeller.add(escrow.getAmount());
                    log.info("Debited {} from seller's eWallet: {} for refunded order item {}",
                            escrow.getAmount(), escrow.getSeller().getEmail(), escrow.getOrderItem().getId());
                } else {
                    totalRefundFromEscrow = totalRefundFromEscrow.add(escrow.getAmount());
                }

                escrow.setStatus(OrderItemEscrow.EscrowStatus.REFUNDED);
                orderItemEscrowRepository.save(escrow);
                log.info("Marked escrow {} as refunded for order item {}", escrow.getId(), escrow.getOrderItem().getId());
            } catch (Exception e) {
                log.error("Failed to process refund for escrow {}: {}", escrow.getId(), e.getMessage(), e);
                return Result.error("Failed to process refund for escrow " + escrow.getId(), "ESCROW_REFUND_FAILED");
            }
        }

        BigDecimal totalRefund = totalRefundFromEscrow.add(totalRefundFromSeller);
        if (totalRefund.compareTo(BigDecimal.ZERO) > 0) {
            UUID firstListingId = escrows.isEmpty() ? null : escrows.get(0).getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, totalRefund, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded total {} to buyer {} (escrow: {}, seller: {})",
                    totalRefund, buyer.getEmail(), totalRefundFromEscrow, totalRefundFromSeller);
        }

        return Result.success();
    }
}
