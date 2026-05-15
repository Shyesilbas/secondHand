package com.serhat.secondhand.user.application.listener;

import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.GreatSellerEligibilitySyncService;
import com.serhat.secondhand.user.application.event.SellerEligibilityRecheckEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class GreatSellerEligibilityEventListener {

    private final GreatSellerEligibilitySyncService greatSellerEligibilitySyncService;
    private final OrderRepository orderRepository;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCompleted(OrderCompletedEvent event) {
        try {
            var loaded = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId());
            if (loaded.isEmpty()) {
                return;
            }
            Set<Long> sellerIds = new LinkedHashSet<>();
            for (var oi : loaded.get().getOrderItems()) {
                if (oi.getSeller() != null && oi.getSeller().getId() != null) {
                    sellerIds.add(oi.getSeller().getId());
                }
            }
            for (Long sid : sellerIds) {
                greatSellerEligibilitySyncService.syncEligibilityAndNotify(sid);
            }
        } catch (Exception e) {
            log.warn("Great Seller sync after order complete failed: {}", e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onSellerRecheck(SellerEligibilityRecheckEvent event) {
        try {
            greatSellerEligibilitySyncService.syncEligibilityAndNotify(event.sellerId());
        } catch (Exception e) {
            log.warn("Great Seller sync after milestone failed: {}", e.getMessage());
        }
    }
}
