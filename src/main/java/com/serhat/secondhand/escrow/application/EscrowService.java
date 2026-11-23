package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.ewallet.dto.WalletTransactionReference;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.application.PaymentStatsCacheEvictor;
import com.serhat.secondhand.payment.contract.PaymentTransactionKind;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
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
    private final com.serhat.secondhand.escrow.outbox.EscrowOutboxService escrowOutboxService;
    private final PaymentStatsCacheEvictor paymentStatsCacheEvictor;
    private final CommissionService commissionService;
    private final com.serhat.secondhand.user.application.SystemAccountService systemAccountService;

    @Transactional
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
        Map<Long, BigDecimal> escrowAmountsByItemId = calculateEscrowAmounts(order);
        Map<Long, BigDecimal> shippingDeductions = allocateShippingDeduction(order, escrowAmountsByItemId);

        for (OrderItem item : order.getOrderItems()) {
            if (existingItemIds.contains(item.getId())) continue;

            User seller = item.getListing().getSeller();
            User buyer = order.getUser();

            BigDecimal heldAmount = escrowAmountsByItemId.getOrDefault(item.getId(), item.getTotalPrice());
            BigDecimal subsidy = item.getCouponDiscount() != null ? item.getCouponDiscount() : BigDecimal.ZERO;
            CommissionService.Commission commission = commissionService.quote(item, order, heldAmount.add(subsidy));

            // 1. Create Escrow Record (Internal tracking)
            Escrow escrow = Escrow.builder()
                    .orderItem(item)
                    .order(order)
                    .buyer(buyer)
                    .seller(seller)
                    .amount(escrowAmountsByItemId.getOrDefault(item.getId(), item.getTotalPrice()))
                    .platformSubsidy(subsidy)
                    .commissionAmount(commission.amount())
                    .commissionRate(commission.ratePercent())
                    .shippingDeduction(shippingDeductions.getOrDefault(item.getId(), BigDecimal.ZERO))
                    .status(PaymentStatus.ESCROW)
                    .listingId(item.getListing().getId())
                    .listingTitle(item.getListing().getTitle())
                    .listingNo(item.getListing().getListingNo())
                    .blockedAt(LocalDateTime.now())
                    .build();

            escrowRepository.save(escrow);
            paymentStatsCacheEvictor.evictUsers(order.getUser(), escrow.getSeller());

            log.info("Escrowed {} for seller {} (Item: {})",
                    escrowAmountsByItemId.getOrDefault(item.getId(), item.getTotalPrice()),
                    seller.getEmail(), item.getListing().getTitle());
        }

        return Result.success();
    }

    /**
     * Splits the seller-carried shipping fee of a free-shipping order across its items by seller gross; the last
     * item takes the rounding remainder. A deduction never exceeds an item's gross after commission.
     */
    private Map<Long, BigDecimal> allocateShippingDeduction(Order order, Map<Long, BigDecimal> escrowAmountsByItemId) {
        BigDecimal charge = order.getSellerShippingCharge();
        if (charge == null || charge.signum() <= 0 || order.getOrderItems().isEmpty()) {
            return Map.of();
        }
        Map<Long, BigDecimal> grossByItem = new java.util.LinkedHashMap<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        for (OrderItem item : order.getOrderItems()) {
            BigDecimal paid = escrowAmountsByItemId.getOrDefault(item.getId(), item.getTotalPrice());
            BigDecimal subsidy = item.getCouponDiscount() != null ? item.getCouponDiscount() : BigDecimal.ZERO;
            BigDecimal gross = paid.add(subsidy);
            grossByItem.put(item.getId(), gross);
            totalGross = totalGross.add(gross);
        }
        if (totalGross.signum() <= 0) {
            return Map.of();
        }
        Map<Long, BigDecimal> result = new java.util.LinkedHashMap<>();
        BigDecimal allocated = BigDecimal.ZERO;
        int index = 0;
        for (Map.Entry<Long, BigDecimal> entry : grossByItem.entrySet()) {
            boolean last = ++index == grossByItem.size();
            BigDecimal share = last
                    ? charge.subtract(allocated)
                    : charge.multiply(entry.getValue()).divide(totalGross, 2, java.math.RoundingMode.HALF_UP);
            share = share.max(BigDecimal.ZERO).min(entry.getValue());
            allocated = allocated.add(share);
            result.put(entry.getKey(), share);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public BigDecimal getPendingEscrowAmount(User seller) {
        return escrowRepository.sumAmountBySellerIdAndStatus(seller.getId(), PaymentStatus.ESCROW);
    }

    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> sumPendingAmountsByOrderIds(List<Long> orderIds, Long sellerId) {
        if (orderIds == null || orderIds.isEmpty()) return Map.of();
        
        return escrowRepository.findByOrderIdInAndSellerIdAndStatus(orderIds, sellerId, PaymentStatus.ESCROW).stream()
                .collect(Collectors.groupingBy(
                        e -> e.getOrder().getId(),
                        Collectors.mapping(Escrow::sellerPayout, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

    /** Escrow states that still pay the seller: held ({@code ESCROW}) or released ({@code COMPLETED}). */
    private static final Set<PaymentStatus> SELLER_EARNING_STATUSES = EnumSet.of(PaymentStatus.ESCROW, PaymentStatus.COMPLETED);

    /**
     * Per order, the seller's share: the buyer-paid escrow amount plus the platform-funded coupon share
     * of lines that are held or released. Cancelled and refunded lines are excluded.
     */
    @Transactional(readOnly = true)
    /** One seller's money on one order: gross (buyer paid + coupon share), commission, shipping deduction, payout (gross - both). */
    public record SellerEarnings(BigDecimal gross, BigDecimal commission, BigDecimal shippingDeduction, BigDecimal payout) {}

    public Map<Long, SellerEarnings> sellerEarningsByOrderIds(List<Long> orderIds, Long sellerId) {
        if (orderIds == null || orderIds.isEmpty()) return Map.of();

        return escrowRepository.findByOrderIdInAndSellerIdAndStatusIn(orderIds, sellerId, SELLER_EARNING_STATUSES).stream()
                .collect(Collectors.groupingBy(
                        e -> e.getOrder().getId(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> new SellerEarnings(
                                list.stream().map(Escrow::sellerGross).reduce(BigDecimal.ZERO, BigDecimal::add),
                                list.stream().map(Escrow::getCommissionAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                                list.stream().map(Escrow::getShippingDeduction).reduce(BigDecimal.ZERO, BigDecimal::add),
                                list.stream().map(Escrow::sellerPayout).reduce(BigDecimal.ZERO, BigDecimal::add)))
                ));
    }

    public Map<Long, BigDecimal> sumSellerAmountsByOrderIds(List<Long> orderIds, Long sellerId) {
        if (orderIds == null || orderIds.isEmpty()) return Map.of();

        return escrowRepository.findByOrderIdInAndSellerIdAndStatusIn(orderIds, sellerId, SELLER_EARNING_STATUSES).stream()
                .collect(Collectors.groupingBy(
                        e -> e.getOrder().getId(),
                        Collectors.mapping(Escrow::sellerPayout, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

    @Transactional
    public Result<Void> release(Order order) {
        log.info("Releasing escrows for order: {}", order.getOrderNumber());
        List<Escrow> escrows = escrowRepository.findByOrderIdAndStatusForUpdate(order.getId(), PaymentStatus.ESCROW);

        if (escrows.isEmpty()) {
            log.warn("No pending escrows found for order: {}", order.getOrderNumber());
            return Result.success();
        }

        for (Escrow escrow : escrows) {
            // 1. Update Escrow record
            escrow.setStatus(PaymentStatus.COMPLETED);
            escrow.setReleasedAt(LocalDateTime.now());
            escrowRepository.save(escrow);
            paymentStatsCacheEvictor.evictUsers(order.getUser(), escrow.getSeller());

            // 2. Update the corresponding Seller-Side Payment record in the history
            List<Payment> sellerPayments = paymentRepository.findByOrderIdAndToUserIdAndOrderItemId(
                    order.getExternalId(), escrow.getSeller().getId(), escrow.getOrderItem().getId());
            
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

            // 3. Enqueue Transactional Outbox Event for resilient asynchronous wallet credit via Kafka
            escrowOutboxService.enqueueEscrowReleased(escrow);

            log.info("Released {} for seller {} (Order: {}) via Transactional Outbox", 
                    escrow.sellerPayout(), escrow.getSeller().getEmail(), order.getOrderNumber());
        }

        return Result.success();
    }

    @Transactional
    public Result<Void> cancel(Order order, List<OrderItem> itemsToCancel) {
        log.info("Cancelling escrows for {} items in order: {}", itemsToCancel.size(), order.getOrderNumber());
        
        List<Long> itemIds = itemsToCancel.stream().map(OrderItem::getId).toList();
        List<Escrow> escrows = escrowRepository.findByOrderItemIdInForUpdate(itemIds);
        Result<Void> escrowValidation = validateEscrowsReadyForCompensation(itemIds, escrows, PaymentStatus.ESCROW);
        if (escrowValidation.isError()) {
            return escrowValidation;
        }

        for (Escrow escrow : escrows) {
            if (escrow.getStatus() == PaymentStatus.ESCROW) {
                escrow.setStatus(PaymentStatus.CANCELLED);
                escrowRepository.save(escrow);
                paymentStatsCacheEvictor.evictUsers(order.getUser(), escrow.getSeller());

                updateSellerPaymentStatus(order.getExternalId(), escrow.getSeller().getId(), escrow.getOrderItem().getId(), PaymentStatus.CANCELLED);

                // 3. Refund the Buyer (Real move)
                // Since this was in ESCROW, money was held by the system (not by the seller).
                // counterpartUser=null so fromUser defaults to buyer (the actual owner of the escrowed funds).
                walletService.creditToUser(order.getUser(), escrow.getAmount(), refundReference(order, escrow), PaymentTransactionKind.REFUND, null);
                
                log.info("Cancelled escrow and refunded {} to buyer for order item {}", 
                        escrow.getAmount(), escrow.getOrderItem().getId());
            }
        }
        return Result.success();
    }

    @Transactional
    public Result<Void> refund(Order order, List<OrderItem> itemsToRefund) {
        log.info("Refunding escrows for {} items in order: {}", itemsToRefund.size(), order.getOrderNumber());
        
        List<Long> itemIds = itemsToRefund.stream().map(OrderItem::getId).toList();
        List<Escrow> escrows = escrowRepository.findByOrderItemIdInForUpdate(itemIds);
        Result<Void> escrowValidation = validateEscrowsReadyForCompensation(itemIds, escrows, PaymentStatus.ESCROW);
        if (escrowValidation.isError()) {
            return escrowValidation;
        }

        for (Escrow escrow : escrows) {
            if (escrow.getStatus() == PaymentStatus.ESCROW) {
                escrow.setStatus(PaymentStatus.REFUNDED);
                escrow.setRefundedAt(LocalDateTime.now());
                escrowRepository.save(escrow);
                paymentStatsCacheEvictor.evictUsers(order.getUser(), escrow.getSeller());

                updateSellerPaymentStatus(order.getExternalId(), escrow.getSeller().getId(), escrow.getOrderItem().getId(), PaymentStatus.REFUNDED);

                // Credit buyer's wallet — money returns from escrow (system), not from seller.
                // counterpartUser=null so fromUser defaults to buyer (the actual owner of the escrowed funds).
                walletService.creditToUser(order.getUser(), escrow.getAmount(), refundReference(order, escrow), PaymentTransactionKind.REFUND, null);
            } else {
                log.warn("Escrow {} for order {} is in {} status, skipping refund. Refund is only possible while funds are in ESCROW.",
                        escrow.getId(), order.getOrderNumber(), escrow.getStatus());
            }
        }
        return Result.success();
    }

    /**
     * Gives the cargo fee back to the buyer when every item of the order was cancelled; the system account
     * gives it up. Runs once per order (shippingFeeRefunded); the caller persists the order.
     */
    public void refundShippingFee(Order order) {
        BigDecimal fee = order.getShippingFee();
        if (fee == null || fee.signum() <= 0 || order.isShippingFeeRefunded()) {
            return;
        }
        OrderItem anyItem = order.getOrderItems().get(0);
        var listing = anyItem.getListing();
        walletService.creditToUser(order.getUser(), fee,
                new WalletTransactionReference(listing.getId(), listing.getTitle(), listing.getListingNo(),
                        order.getExternalId(), null),
                PaymentTransactionKind.REFUND, null);
        walletService.creditWalletQuietly(systemAccountService.getSystemUser(), fee.negate());
        order.setShippingFeeRefunded(true);
        log.info("Refunded shipping fee {} to buyer for order {}", fee, order.getOrderNumber());
    }

    // Links the refund payment to its order (Order.externalId, as payment.order_id stores it) and order line.
    private static WalletTransactionReference refundReference(Order order, Escrow escrow) {
        return new WalletTransactionReference(escrow.getListingId(), escrow.getListingTitle(), escrow.getListingNo(),
                order.getExternalId(), escrow.getOrderItem().getId());
    }

    private Result<Void> validateEscrowsReadyForCompensation(List<Long> itemIds, List<Escrow> escrows, PaymentStatus requiredStatus) {
        Set<Long> foundItemIds = escrows.stream()
                .map(escrow -> escrow.getOrderItem().getId())
                .collect(Collectors.toSet());
        List<Long> missingItemIds = itemIds.stream()
                .filter(itemId -> !foundItemIds.contains(itemId))
                .toList();
        if (!missingItemIds.isEmpty()) {
            log.error("Escrow compensation failed. Missing escrow records for order item ids: {}", missingItemIds);
            return Result.error("Missing escrow records for selected order items.", "ESCROW_NOT_FOUND");
        }

        List<Long> invalidStatusItemIds = escrows.stream()
                .filter(escrow -> escrow.getStatus() != requiredStatus)
                .map(escrow -> escrow.getOrderItem().getId())
                .toList();
        if (!invalidStatusItemIds.isEmpty()) {
            log.error("Escrow compensation failed. Escrows are not in {} for order item ids: {}",
                    requiredStatus, invalidStatusItemIds);
            return Result.error("Selected order items are not refundable from escrow.", "ESCROW_STATUS_INVALID");
        }

        return Result.success();
    }

    private void updateSellerPaymentStatus(UUID orderId, Long sellerId, Long orderItemId, PaymentStatus newStatus) {
        List<Payment> sellerPayments = paymentRepository.findByOrderIdAndToUserIdAndOrderItemId(orderId, sellerId, orderItemId);
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

    private Map<Long, BigDecimal> calculateEscrowAmounts(Order order) {
        Map<Long, BigDecimal> amountsByItemId = new HashMap<>();
        if (order == null || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return amountsByItemId;
        }

        List<OrderItem> items = new ArrayList<>(order.getOrderItems());
        items.sort(Comparator.comparing(OrderItem::getId, Comparator.nullsLast(Long::compareTo)));

        BigDecimal itemSubtotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (itemSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            items.forEach(item -> amountsByItemId.put(item.getId(), BigDecimal.ZERO));
            return amountsByItemId;
        }

        BigDecimal payableTotal = order.getTotalAmount() != null ? order.getTotalAmount() : itemSubtotal;
        if (payableTotal.compareTo(BigDecimal.ZERO) < 0) {
            payableTotal = BigDecimal.ZERO;
        }
        if (payableTotal.compareTo(itemSubtotal) > 0) {
            payableTotal = itemSubtotal;
        }
        payableTotal = payableTotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal remaining = payableTotal;
        for (int i = 0; i < items.size(); i++) {
            OrderItem item = items.get(i);
            BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO;
            BigDecimal amount;
            if (i == items.size() - 1) {
                amount = remaining;
            } else {
                amount = payableTotal.multiply(itemTotal)
                        .divide(itemSubtotal, 2, RoundingMode.HALF_UP);
                if (amount.compareTo(remaining) > 0) {
                    amount = remaining;
                }
            }
            amount = amount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            amountsByItemId.put(item.getId(), amount);
            remaining = remaining.subtract(amount).setScale(2, RoundingMode.HALF_UP);
        }
        return amountsByItemId;
    }
}
