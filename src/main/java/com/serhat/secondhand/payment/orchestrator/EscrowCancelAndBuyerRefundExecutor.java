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
public class EscrowCancelAndBuyerRefundExecutor {

    private final IEWalletService eWalletService;
    private final OrderItemEscrowRepository orderItemEscrowRepository;

    public Result<Void> execute(List<OrderItemEscrow> escrows, User buyer) {
        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
                log.debug("Escrow {} already cancelled, skipping", escrow.getId());
                continue;
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                log.warn("Cannot cancel completed escrow {}", escrow.getId());
                return Result.error("Escrow cannot be cancelled: " + escrow.getId(), "ESCROW_CANCEL_INVALID_STATUS");
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
                log.warn("Cannot cancel refunded escrow {}", escrow.getId());
                return Result.error("Escrow cannot be cancelled: " + escrow.getId(), "ESCROW_CANCEL_INVALID_STATUS");
            }

            totalRefundAmount = totalRefundAmount.add(escrow.getAmount());
            escrow.setStatus(OrderItemEscrow.EscrowStatus.CANCELLED);
            orderItemEscrowRepository.save(escrow);
            log.info("Cancelled escrow {} amount {} for buyer {}",
                    escrow.getId(), escrow.getAmount(), buyer.getEmail());
        }

        if (totalRefundAmount.compareTo(BigDecimal.ZERO) > 0) {
            UUID firstListingId = escrows.isEmpty() ? null : escrows.get(0).getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, totalRefundAmount, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded total {} to buyer {} from cancelled escrows", totalRefundAmount, buyer.getEmail());
        }

        return Result.success();
    }
}
