package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.order.application.OrderCancellationService;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.event.UserBannedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Proposal section 5.2: once a seller ban commits, their paid but unshipped cargo orders are cancelled
 * and refunded. Each order runs in its own transaction, so one failed refund rolls back only that order;
 * anything left over is still caught by the ship-deadline scheduler. Meetup orders keep their own path.
 */
@Component
@Slf4j
public class BannedSellerOrderCancellationListener {

    static final int BATCH_SIZE = 100;
    static final List<OrderStatus> UNSHIPPED = List.of(OrderStatus.CONFIRMED, OrderStatus.PROCESSING);
    private static final Pageable FIRST_BATCH = PageRequest.of(0, BATCH_SIZE);

    private final OrderRepository orderRepository;
    private final OrderCancellationService orderCancellationService;
    private final TransactionTemplate transactionTemplate;

    public BannedSellerOrderCancellationListener(OrderRepository orderRepository,
                                                 OrderCancellationService orderCancellationService,
                                                 PlatformTransactionManager transactionManager) {
        this.orderRepository = orderRepository;
        this.orderCancellationService = orderCancellationService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserBanned(UserBannedEvent event) {
        cancelUnshippedOrdersOf(event.userId());
    }

    /** Returns how many orders were cancelled. */
    int cancelUnshippedOrdersOf(Long sellerId) {
        Set<Long> attempted = new HashSet<>();
        int cancelled = 0;
        while (true) {
            List<Long> ids = orderRepository.findIdsOfSellerOnlyOrders(sellerId, UNSHIPPED, DeliveryMethod.CARGO, FIRST_BATCH)
                    .stream().filter(attempted::add).toList();
            // Failed orders stay in the result set; stop once a batch brings nothing new.
            if (ids.isEmpty()) {
                break;
            }
            for (Long orderId : ids) {
                if (cancelOne(sellerId, orderId)) {
                    cancelled++;
                }
            }
        }
        log.info("Cancelled {} unshipped order(s) of banned seller {}", cancelled, sellerId);
        return cancelled;
    }

    private boolean cancelOne(Long sellerId, Long orderId) {
        try {
            Boolean ok = transactionTemplate.execute(tx -> {
                var result = orderCancellationService.cancelForRestrictedSeller(orderId);
                if (result.isError()) {
                    log.warn("Order {} of banned seller {} was not cancelled: {}", orderId, sellerId, result.getErrorCode());
                    return false;
                }
                return true;
            });
            return Boolean.TRUE.equals(ok);
        } catch (Exception e) {
            log.error("Cancelling order {} of banned seller {} failed", orderId, sellerId, e);
            return false;
        }
    }
}
