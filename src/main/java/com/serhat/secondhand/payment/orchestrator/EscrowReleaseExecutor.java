package com.serhat.secondhand.payment.orchestrator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.service.IEWalletService;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EscrowReleaseExecutor {

    private final IEWalletService eWalletService;
    private final OrderItemEscrowRepository orderItemEscrowRepository;

    public Result<Void> execute(List<OrderItemEscrow> escrows) {
        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        int successCount = 0;
        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                log.debug("Escrow {} already released, skipping", escrow.getId());
                successCount++;
                continue;
            }

            if (escrow.getStatus() != OrderItemEscrow.EscrowStatus.PENDING) {
                log.warn("Escrow {} is not in PENDING status ({}), skipping",
                        escrow.getId(), escrow.getStatus());
                return Result.error("Escrow is not releasable: " + escrow.getId(), "ESCROW_RELEASE_INVALID_STATUS");
            }

            try {
                UUID listingId = escrow.getOrderItem().getListing().getId();
                eWalletService.creditToUser(
                        escrow.getSeller(),
                        escrow.getAmount(),
                        listingId,
                        PaymentTransactionType.ITEM_SALE
                );
                escrow.setStatus(OrderItemEscrow.EscrowStatus.COMPLETED);
                orderItemEscrowRepository.save(escrow);
                log.info("Released escrow {} amount {} to seller {}",
                        escrow.getId(), escrow.getAmount(), escrow.getSeller().getEmail());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to release escrow {} to seller {}: {}",
                        escrow.getId(), escrow.getSeller().getEmail(), e.getMessage(), e);
                return Result.error("Failed to release escrow " + escrow.getId(), "ESCROW_RELEASE_FAILED");
            }
        }

        log.info("Escrow release completed: {} successful", successCount);
        return Result.success();
    }
}
