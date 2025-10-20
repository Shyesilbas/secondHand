package com.serhat.secondhand.refund.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.refund.dto.CreateRefundRequestDto;
import com.serhat.secondhand.refund.dto.RefundRequestDto;
import com.serhat.secondhand.refund.entity.RefundRequest;
import com.serhat.secondhand.refund.entity.RefundStatus;
import com.serhat.secondhand.refund.mapper.RefundMapper;
import com.serhat.secondhand.refund.repository.RefundRequestRepository;
import com.serhat.secondhand.refund.util.RefundErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final RefundRequestRepository refundRequestRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final RefundMapper refundMapper;

    private static final long CANCELLATION_WINDOW_HOURS = 1;

    @Transactional
    public RefundRequestDto createRefundRequest(CreateRefundRequestDto dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to refund this order");
        }

        if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            throw new RuntimeException("Order is not paid yet");
        }

        OrderItem orderItem = orderItemRepository.findById(dto.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (!orderItem.getOrder().getId().equals(order.getId())) {
            throw new RuntimeException("Order item does not belong to this order");
        }

        long hoursSinceOrder = ChronoUnit.HOURS.between(order.getCreatedAt(), LocalDateTime.now());
        if (hoursSinceOrder >= CANCELLATION_WINDOW_HOURS) {
            throw new RuntimeException("Cancellation period has expired. You can only cancel within 1 hour of order creation.");
        }

        List<RefundStatus> activeStatuses = Arrays.asList(
                RefundStatus.PENDING,
                RefundStatus.PROCESSING,
                RefundStatus.APPROVED
        );

        if (refundRequestRepository.existsByOrderItemIdAndStatusIn(orderItem.getId(), activeStatuses)) {
            throw new RuntimeException("A refund request already exists for this item");
        }

        PaymentType refundMethod = determineRefundMethod(order);

        RefundRequest refundRequest = RefundRequest.builder()
                .refundNumber(generateRefundNumber())
                .order(order)
                .orderItem(orderItem)
                .user(user)
                .status(RefundStatus.PENDING)
                .refundAmount(orderItem.getTotalPrice())
                .currency(orderItem.getCurrency())
                .reason(dto.getReason())
                .refundMethod(refundMethod)
                .build();

        refundRequest = refundRequestRepository.save(refundRequest);
        log.info("Refund request created: {} for order item: {}", refundRequest.getRefundNumber(), orderItem.getId());

        return refundMapper.toDto(refundRequest);
    }

    @Transactional(readOnly = true)
    public RefundRequestDto getRefundRequest(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefundRequest refundRequest = refundRequestRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Refund request not found"));

        return refundMapper.toDto(refundRequest);
    }

    @Transactional(readOnly = true)
    public Page<RefundRequestDto> getUserRefundRequests(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return refundRequestRepository.findByUserId(user.getId(), pageable)
                .map(refundMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<RefundRequestDto> getOrderRefundRequests(Long orderId, Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view refund requests for this order");
        }

        return refundRequestRepository.findByOrderId(orderId, pageable)
                .map(refundMapper::toDto);
    }

    @Transactional
    public void cancelRefundRequest(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefundRequest refundRequest = refundRequestRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Refund request not found"));

        if (refundRequest.getStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("Only pending refund requests can be cancelled");
        }

        refundRequest.setStatus(RefundStatus.CANCELLED);
        refundRequest.setUpdatedAt(LocalDateTime.now());
        refundRequestRepository.save(refundRequest);

        log.info("Refund request cancelled: {}", refundRequest.getRefundNumber());
    }


    public int processPendingRefunds() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minus(CANCELLATION_WINDOW_HOURS, ChronoUnit.HOURS);
        List<RefundRequest> pendingRefunds = refundRequestRepository
                .findByStatusAndCreatedAtBefore(RefundStatus.PENDING, oneHourAgo);

        log.info("Found {} pending refund requests to process", pendingRefunds.size());

        int successCount = 0;
        int failureCount = 0;

        List<Long> refundIds = pendingRefunds.stream()
                .map(RefundRequest::getId)
                .toList();

        for (Long refundId : refundIds) {
            try {
                processRefundById(refundId);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                log.error("Error processing refund ID {}: {}", refundId, e.getMessage());
            }
        }

        log.info("Refund processing completed. Success: {}, Failed: {}", successCount, failureCount);
        return successCount;
    }

    @Transactional
    public void processRefundById(Long refundId) {
        RefundRequest refund = refundRequestRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(RefundErrorCodes.REFUND_NOT_FOUND));
        processRefund(refund);
    }

    @Transactional
    public void processRefund(RefundRequest refund) {
        log.info("Processing refund: {} (ID: {})", refund.getRefundNumber(), refund.getId());

        RefundRequest freshRefund = refundRequestRepository.findById(refund.getId())
                .orElseThrow(() -> new BusinessException(RefundErrorCodes.REFUND_NOT_FOUND));

        if (freshRefund.getStatus() != RefundStatus.PENDING) {
            log.warn("Refund {} already processed by another thread. Current status: {}", 
                    freshRefund.getRefundNumber(), freshRefund.getStatus());
            return;
        }

        freshRefund.setStatus(RefundStatus.PROCESSING);
        freshRefund.setProcessedAt(LocalDateTime.now());
        refundRequestRepository.saveAndFlush(freshRefund);

        try {
            executeRefund(freshRefund);

            freshRefund.setStatus(RefundStatus.COMPLETED);
            freshRefund.setCompletedAt(LocalDateTime.now());
            refundRequestRepository.saveAndFlush(freshRefund);

            updateOrderStatus(freshRefund.getOrder());

            log.info("Refund completed: {}", freshRefund.getRefundNumber());
        } catch (Exception e) {
            log.error("Error during refund execution: {}", e.getMessage(), e);
            
            freshRefund.setStatus(RefundStatus.REJECTED);
            freshRefund.setAdminNotes("Auto-rejected due to processing error: " + 
                    (e.getMessage() != null && e.getMessage().length() > 200 ? e.getMessage().substring(0, 200) : e.getMessage()));
            freshRefund.setUpdatedAt(LocalDateTime.now());
            refundRequestRepository.saveAndFlush(freshRefund);
            log.info("Refund {} marked as REJECTED due to processing error", freshRefund.getRefundNumber());
            
            throw e;
        }
    }

    private void executeRefund(RefundRequest refund) {
        User seller = refund.getOrderItem().getListing().getSeller();
        User buyer = refund.getUser();

        Payment refundPayment = Payment.builder()
                .id(UUID.randomUUID())
                .amount(refund.getRefundAmount())
                .listingId(refund.getOrderItem().getListing().getId())
                .paymentType(refund.getRefundMethod())
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.OUTGOING)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .fromUser(seller)
                .toUser(buyer)
                .build();

        paymentRepository.save(refundPayment);

        refund.setRefundReference(refundPayment.getId().toString());

        log.info("Refund payment created: {} for amount: {}", refundPayment.getId(), refund.getRefundAmount());
    }

    private void updateOrderStatus(Order order) {
        List<OrderItem> orderItems = order.getOrderItems();
        long totalItems = orderItems.size();
        long refundedItems = orderItems.stream()
                .filter(item -> {
                    return refundRequestRepository.findByOrderItemId(item.getId())
                            .map(r -> r.getStatus() == RefundStatus.COMPLETED)
                            .orElse(false);
                })
                .count();

        if (totalItems == refundedItems) {
            order.setStatus(Order.OrderStatus.REFUNDED);
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            orderRepository.save(order);
            log.info("Order {} fully refunded", order.getOrderNumber());
        }
    }

    private PaymentType determineRefundMethod(Order order) {
        return order.getPaymentMethod() != null ? order.getPaymentMethod() : PaymentType.EWALLET;
    }

    private String generateRefundNumber() {
        return "RF" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional(readOnly = true)
    public boolean canCancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        long hoursSinceOrder = ChronoUnit.HOURS.between(order.getCreatedAt(), LocalDateTime.now());
        return hoursSinceOrder < CANCELLATION_WINDOW_HOURS;
    }

    @Transactional(readOnly = true)
    public boolean canCancelOrderItem(Long orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        long hoursSinceOrder = ChronoUnit.HOURS.between(orderItem.getOrder().getCreatedAt(), LocalDateTime.now());
        if (hoursSinceOrder >= CANCELLATION_WINDOW_HOURS) {
            return false;
        }

        List<RefundStatus> activeStatuses = Arrays.asList(
                RefundStatus.PENDING,
                RefundStatus.PROCESSING,
                RefundStatus.APPROVED,
                RefundStatus.COMPLETED
        );

        return !refundRequestRepository.existsByOrderItemIdAndStatusIn(orderItem.getId(), activeStatuses);
    }
}

