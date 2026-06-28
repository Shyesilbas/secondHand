package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderCompletionPolicy;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusConsistencyLogger;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCompletionService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderStatusConsistencyLogger orderStatusConsistencyLogger;
    private final EscrowService escrowService;
    private final OrderValidationService orderValidationService;
    private final OrderLogService orderLog;
    private final OrderCompletionPolicy orderCompletionPolicy;
    private final ApplicationEventPublisher eventPublisher;

    @CacheEvict(value = "pendingOrders", key = "#user.id")
    public Result<OrderDto> completeOrder(Long orderId, User user) {
        Result<Order> orderResult = validateOrderForCompletion(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> releaseResult = releaseEscrowsForOrder(order);
        if (releaseResult.isError()) return escrowReleaseFailed();

        order.applyCompletion();
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, user, false));

        orderLog.logOrderCompleted(order.getOrderNumber(), false);
        return Result.success(orderMapper.toDto(savedOrder));
    }

    public Result<Void> verifyMeetupCode(String orderNumber, String code, User user) {
        Order order = orderRepository.findByOrderNumberWithItemsAndSellers(orderNumber)
                .orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        // Verify that user is the seller of items in this order
        boolean isSeller = order.getOrderItems().stream()
                .anyMatch(item -> item.getSeller().getId().equals(user.getId()));
        if (!isSeller) {
            return Result.error(OrderErrorCodes.NOT_AUTHORIZED_FOR_ORDER);
        }

        // Check if code has expired (5 minutes)
        if (order.getMeetupVerificationCodeGeneratedAt() != null) {
            if (order.getMeetupVerificationCodeGeneratedAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
                return Result.error(OrderErrorCodes.MEETUP_CODE_EXPIRED);
            }
        }

        // Check lock state
        if (order.getVerificationLockedUntil() != null) {
            if (order.getVerificationLockedUntil().isAfter(LocalDateTime.now())) {
                return Result.error("Verification is locked until " + order.getVerificationLockedUntil(), OrderErrorCodes.VERIFICATION_LOCKED.getCode());
            } else {
                // Lock expired, reset attempts
                order.setVerificationAttempts(0);
                order.setVerificationLockedUntil(null);
                if (order.getStatus() == OrderStatus.VERIFICATION_LOCKED) {
                    order.setStatus(OrderStatus.MEETUP_PENDING);
                }
            }
        }

        if (order.getStatus() != OrderStatus.MEETUP_PENDING && order.getStatus() != OrderStatus.VERIFICATION_LOCKED) {
            return Result.error("Order is not in a verification pending state", OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode());
        }

        String hashedInput = Order.hashSha256(code);
        if (hashedInput != null && hashedInput.equals(order.getMeetupVerificationCodeHash())) {
            OrderStatus oldStatus = order.getStatus();
            order.setStatus(OrderStatus.HANDOVER_CONFIRMED);
            order.setMeetupVerifiedAt(LocalDateTime.now());
            order.setVerificationAttempts(0);
            order.setVerificationLockedUntil(null);
            Order savedOrder = orderRepository.save(order);

            eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.HANDOVER_CONFIRMED.name()));
            orderLog.logStatusChanged(savedOrder.getOrderNumber(), oldStatus.name(), "HANDOVER_CONFIRMED");

            return Result.success();
        } else {
            int newAttempts = order.getVerificationAttempts() + 1;
            order.setVerificationAttempts(newAttempts);
            if (newAttempts >= 3) {
                OrderStatus oldStatus = order.getStatus();
                order.setStatus(OrderStatus.VERIFICATION_LOCKED);
                order.setVerificationLockedUntil(LocalDateTime.now().plusMinutes(15));
                Order savedOrder = orderRepository.save(order);

                eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.VERIFICATION_LOCKED.name()));
                orderLog.logStatusChanged(savedOrder.getOrderNumber(), oldStatus.name(), "VERIFICATION_LOCKED");

                return Result.error("Too many failed attempts. Verification locked for 15 minutes.", OrderErrorCodes.VERIFICATION_LOCKED.getCode());
            } else {
                orderRepository.save(order);
                return Result.error("Meetup verification code is incorrect. Attempts left: " + (3 - newAttempts), OrderErrorCodes.MEETUP_VERIFICATION_FAILED.getCode());
            }
        }
    }

    public Result<OrderDto> confirmHandoverCompletion(String orderNumber, boolean confirmed, User user) {
        if (!confirmed) {
            return Result.error("You must check the confirmation checkbox to finalize", "CONFIRMATION_REQUIRED");
        }

        Order order = orderRepository.findByOrderNumberWithItemsAndSellers(orderNumber)
                .orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        boolean isBuyer = order.getUser().getId().equals(user.getId());
        boolean isSeller = order.getOrderItems().stream()
                .anyMatch(item -> item.getSeller().getId().equals(user.getId()));

        if (!isBuyer && !isSeller) {
            return Result.error(OrderErrorCodes.NOT_AUTHORIZED_FOR_ORDER);
        }

        if (order.getStatus() != OrderStatus.HANDOVER_CONFIRMED && order.getStatus() != OrderStatus.MEETUP_PENDING) {
            return Result.error("Order handover is not confirmed yet", OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode());
        }

        if (order.getStatus() == OrderStatus.MEETUP_PENDING && !isBuyer) {
            return Result.error("Only the buyer can manually complete a pending meetup order without code verification", OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode());
        }

        Result<Void> releaseResult = releaseEscrowsForOrder(order);
        if (releaseResult.isError()) return escrowReleaseFailed();

        OrderStatus oldStatus = order.getStatus();
        order.applyCompletion();
        order.setCompletedByUser(user);
        order.setCompletedAt(LocalDateTime.now());
        
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, user, false));
        eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.COMPLETED.name()));

        orderLog.logOrderCompleted(order.getOrderNumber(), false);
        return Result.success(orderMapper.toDto(savedOrder));
    }

    public Result<OrderDto> regenerateMeetupCode(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumberWithItemsAndSellers(orderNumber)
                .orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        boolean isBuyer = order.getUser().getId().equals(user.getId());
        if (!isBuyer) {
            return Result.error(OrderErrorCodes.NOT_AUTHORIZED_FOR_ORDER);
        }

        // Enforce rate limit (30 seconds) on code regeneration
        if (order.getMeetupVerificationCodeGeneratedAt() != null) {
            if (order.getMeetupVerificationCodeGeneratedAt().isAfter(LocalDateTime.now().minusSeconds(30))) {
                return Result.error("Please wait at least 30 seconds between code regenerations", "RATE_LIMIT_EXCEEDED");
            }
        }

        order.generateVerificationCode();
        Order savedOrder = orderRepository.save(order);

        OrderDto dto = orderMapper.toDto(savedOrder);
        dto.setMeetupVerificationCode(savedOrder.getMeetupVerificationCode());
        return Result.success(dto);
    }

    public byte[] generateMeetupQrCode(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumberWithItemsAndSellers(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        boolean isBuyer = order.getUser().getId().equals(user.getId());
        if (!isBuyer) {
            throw new SecurityException("Unauthorized to generate QR code for this order");
        }

        if (order.getMeetupVerificationCodeHash() == null) {
            order.generateVerificationCode();
            orderRepository.save(order);
        }

        String qrContent = order.getMeetupVerificationCode();
        if (qrContent == null) {
            order.generateVerificationCode();
            orderRepository.save(order);
            qrContent = order.getMeetupVerificationCode();
        }

        try {
            com.google.zxing.qrcode.QRCodeWriter qrCodeWriter = new com.google.zxing.qrcode.QRCodeWriter();
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(
                    qrContent,
                    com.google.zxing.BarcodeFormat.QR_CODE,
                    250,
                    250
            );

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(
                    bitMatrix,
                    "PNG",
                    pngOutputStream
            );
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code image", e);
        }
    }

    private Result<Order> validateOrderForCompletion(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult;

        Order order = orderResult.getData();

        Result<Void> completionValidationResult = orderCompletionPolicy.validateCompletable(order);
        if (completionValidationResult.isError()) return completionValidationResult.propagateError();

        orderStatusConsistencyLogger.logIfInconsistent(order);

        return Result.success(order);
    }

    private Result<OrderDto> escrowReleaseFailed() {
        return Result.error(
                "Order completion failed during escrow release",
                OrderErrorCodes.ORDER_COMPLETION_ESCROW_RELEASE_FAILED.getCode()
        );
    }

    private Result<Void> releaseEscrowsForOrder(Order order) {
        Result<Void> orchestratorResult = escrowService.release(order);
        
        if (orchestratorResult.isError()) {
            return Result.error(orchestratorResult.getMessage(), orchestratorResult.getErrorCode());
        } else {
            return Result.success();
        }
    }
}

