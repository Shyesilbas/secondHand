package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final PaymentRepository paymentRepository;
    private final IEWalletService walletService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "paymentStats", allEntries = true)
    public Result<Void> hold(Order order) {
        log.info("Creating escrows for order: {}", order.getOrderNumber());
        
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return Result.success();
        }

        List<Long> itemIds = order.getOrderItems().stream()
                .map(OrderItem::getId)
                .toList();
                
        Set<Long> existingItemIds = escrowRepository.findByOrderItemIdIn(itemIds).stream()
                .map(e -> e.getOrderItem().getId())
                .collect(Collectors.toSet());

        for (OrderItem item : order.getOrderItems()) {
            if (existingItemIds.contains(item.getId())) continue;

            User seller = item.getListing().getSeller();
            User buyer = order.getUser();

            // 1. Create Escrow Record (Internal tracking)
            Escrow escrow = Escrow.builder()
                    .orderItem(item)
                    .order(order)
                    .buyer(buyer)
                    .seller(seller)
                    .amount(item.getTotalPrice())
                    .status(PaymentStatus.ESCROW)
                    .listingId(item.getListing().getId())
                    .listingTitle(item.getListing().getTitle())
                    .listingNo(item.getListing().getListingNo())
                    .blockedAt(LocalDateTime.now())
                    .build();

            escrowRepository.save(escrow);

            log.info("Escrowed {} for seller {} (Item: {})", item.getTotalPrice(), seller.getEmail(), item.getListing().getTitle());
        }

        return Result.success();
    }

    @Transactional(readOnly = true)
    public BigDecimal getPendingEscrowAmount(User seller) {
        return escrowRepository.findBySellerId(seller.getId()).stream()
                .filter(escrow -> escrow.getStatus() == PaymentStatus.ESCROW)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> sumPendingAmountsByOrderIds(List<Long> orderIds, Long sellerId) {
        if (orderIds == null || orderIds.isEmpty()) return Map.of();
        
        return escrowRepository.findByOrderIdInAndSellerIdAndStatus(orderIds, sellerId, PaymentStatus.ESCROW).stream()
                .collect(Collectors.groupingBy(
                        e -> e.getOrder().getId(),
                        Collectors.mapping(Escrow::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "paymentStats", allEntries = true)
    public Result<Void> release(Order order) {
        log.info("Releasing escrows for order: {}", order.getOrderNumber());
        List<Escrow> escrows = escrowRepository.findByOrderIdAndStatus(order.getId(), PaymentStatus.ESCROW);

        if (escrows.isEmpty()) {
            log.warn("No pending escrows found for order: {}", order.getOrderNumber());
            return Result.success();
        }

        for (Escrow escrow : escrows) {
            // 1. Update Escrow record
            escrow.setStatus(PaymentStatus.COMPLETED);
            escrow.setReleasedAt(LocalDateTime.now());
            escrowRepository.save(escrow);

            // 2. Update the corresponding Seller-Side Payment record in the history
            List<Payment> sellerPayments = paymentRepository.findByOrderIdAndToUserId(
                    order.getExternalId(), escrow.getSeller().getId());
            
            for (Payment payment : sellerPayments) {
                if (payment.getStatus() == PaymentStatus.ESCROW && 
                    (payment.getTransactionType() == PaymentTransactionType.ITEM_SALE || 
                     payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE)) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setProcessedAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                    eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
                }
            }

            // 3. Credit the money to Seller's Wallet (Real move)
            // Note: We use a new internal credit method that doesn't create duplicate payment records
            creditWalletQuietly(escrow.getSeller(), escrow.getAmount());

            log.info("Released {} to seller {} for order item {}", 
                    escrow.getAmount(), escrow.getSeller().getEmail(), escrow.getOrderItem().getId());
        }

        return Result.success();
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "paymentStats", allEntries = true)
    public Result<Void> cancel(Order order, List<OrderItem> itemsToCancel) {
        log.info("Cancelling escrows for {} items in order: {}", itemsToCancel.size(), order.getOrderNumber());
        
        List<Long> itemIds = itemsToCancel.stream().map(OrderItem::getId).toList();
        List<Escrow> escrows = escrowRepository.findByOrderItemIdIn(itemIds);

        for (Escrow escrow : escrows) {
            if (escrow.getStatus() == PaymentStatus.ESCROW) {
                escrow.setStatus(PaymentStatus.CANCELLED);
                escrowRepository.save(escrow);

                updateSellerPaymentStatus(order.getExternalId(), escrow.getSeller().getId(), PaymentStatus.CANCELLED);

                // 3. Refund the Buyer (Real move)
                // Since this was in ESCROW, money was held by the system (not by the seller).
                // counterpartUser=null so fromUser defaults to buyer (the actual owner of the escrowed funds).
                walletService.creditToUser(order.getUser(), escrow.getAmount(), escrow.getListingId(), PaymentTransactionType.REFUND, null);
                
                log.info("Cancelled escrow and refunded {} to buyer for order item {}", 
                        escrow.getAmount(), escrow.getOrderItem().getId());
            }
        }
        return Result.success();
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "paymentStats", allEntries = true)
    public Result<Void> refund(Order order, List<OrderItem> itemsToRefund) {
        log.info("Refunding escrows for {} items in order: {}", itemsToRefund.size(), order.getOrderNumber());
        
        List<Long> itemIds = itemsToRefund.stream().map(OrderItem::getId).toList();
        List<Escrow> escrows = escrowRepository.findByOrderItemIdIn(itemIds);

        for (Escrow escrow : escrows) {
            if (escrow.getStatus() == PaymentStatus.ESCROW) {
                escrow.setStatus(PaymentStatus.REFUNDED);
                escrow.setRefundedAt(LocalDateTime.now());
                escrowRepository.save(escrow);

                updateSellerPaymentStatus(order.getExternalId(), escrow.getSeller().getId(), PaymentStatus.REFUNDED);

                // Credit buyer's wallet — money returns from escrow (system), not from seller.
                // counterpartUser=null so fromUser defaults to buyer (the actual owner of the escrowed funds).
                walletService.creditToUser(order.getUser(), escrow.getAmount(), escrow.getListingId(), PaymentTransactionType.REFUND, null);
            } else {
                log.warn("Escrow {} for order {} is in {} status, skipping refund. Refund is only possible while funds are in ESCROW.",
                        escrow.getId(), order.getOrderNumber(), escrow.getStatus());
            }
        }
        return Result.success();
    }

    private void updateSellerPaymentStatus(UUID orderId, Long sellerId, PaymentStatus newStatus) {
        List<Payment> sellerPayments = paymentRepository.findByOrderIdAndToUserId(orderId, sellerId);
        for (Payment payment : sellerPayments) {
            if (payment.getTransactionType() == PaymentTransactionType.ITEM_SALE || 
                payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE) {
                payment.setStatus(newStatus);
                paymentRepository.save(payment);
                // Only publish if it's completing or similar terminal success state
                if (newStatus == PaymentStatus.COMPLETED) {
                    eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
                }
            }
        }
    }

    /**
     * Credits the wallet without creating a new Payment record, 
     * since we already created/updated it in the escrow flow.
     */
    private void creditWalletQuietly(User user, BigDecimal amount) {
        walletService.creditWalletQuietly(user, amount);
    }
}
