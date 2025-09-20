package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.service.PaymentService;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.shipping.ShippingService;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.serhat.secondhand.order.util.OrderErrorCodes;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;
    private final AddressService addressService;
    private final PaymentService paymentService;
    private final EmailService emailService;
    private final UserService userService;
    private final ShippingService shippingService;


    public OrderDto checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getEmail());

        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        if (cartItems.isEmpty()) {
            throw new BusinessException(OrderErrorCodes.CART_EMPTY);
        }

        Address shippingAddress = addressService.getAddressById(request.getShippingAddressId());
        Address billingAddress = request.getBillingAddressId() != null
                ? addressService.getAddressById(request.getBillingAddressId())
                : null;

        validateAddresses(user, shippingAddress, billingAddress);

        BigDecimal totalAmount = cartItems.stream()
                .map(cart -> cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .currency("TRY")
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .shippingStatus(ShippingStatus.PENDING)
                .notes(request.getNotes())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cartItems.stream()
                .map(cart -> OrderItem.builder()
                        .order(order)
                        .listing(cart.getListing())
                        .quantity(cart.getQuantity())
                        .unitPrice(cart.getListing().getPrice())
                        .totalPrice(cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                        .currency("TRY")
                        .notes(cart.getNotes())
                        .build())
                .toList();

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and order number: {}", savedOrder.getId(), orderNumber);

        List<PaymentDto> results;
        boolean allPaid;

        try {
            results = processPayments(user, cartItems, request, savedOrder);
            allPaid = results.stream().allMatch(PaymentDto::isSuccess);

            savedOrder.setPaymentReference(results.get(0).paymentId().toString());
            savedOrder.setPaymentStatus(allPaid ? Order.PaymentStatus.PAID : Order.PaymentStatus.FAILED);
            savedOrder.setStatus(allPaid ? Order.OrderStatus.CONFIRMED : Order.OrderStatus.CANCELLED);

            orderRepository.save(savedOrder);
        } catch (BusinessException e) {
            log.error("Payment failed for order: {} - {}", orderNumber, e.getMessage());
            savedOrder.setPaymentStatus(Order.PaymentStatus.FAILED);
            savedOrder.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(savedOrder);
            throw e;
        } catch (Exception e) {
            log.error("Payment failed for order: {}", orderNumber, e);
            savedOrder.setPaymentStatus(Order.PaymentStatus.FAILED);
            savedOrder.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }

        sendNotifications(user, savedOrder, allPaid);

        if (allPaid) {
            cartRepository.deleteByUser(user);
            log.info("Payment processed successfully for order: {} ({} sub-payments)", orderNumber, results.size());
        } else {
            log.warn("One or more sub-payments failed for order: {}", orderNumber);
        }

        return orderMapper.toDto(savedOrder);
    }



    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(User user, Pageable pageable) {
        log.info("Getting orders for user: {}", user.getEmail());
        Page<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        shippingService.updateShippingStatusesForOrders(orders.getContent());

        return orders.map(orderMapper::toDto);
    }



    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }

        shippingService.calculateShippingStatus(order);

        return orderMapper.toDto(order);
    }


    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }

        shippingService.calculateShippingStatus(order);

        return orderMapper.toDto(order);
    }


    public OrderDto cancelOrder(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new BusinessException(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        log.info("Order cancelled: {}", order.getOrderNumber());

        return orderMapper.toDto(savedOrder);
    }

    private void validateAddresses(User user, Address shippingAddress, Address billingAddress) {
        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER);
        }
        if (billingAddress != null && !billingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER);
        }
    }

    private List<PaymentDto> processPayments(User user, List<Cart> cartItems, CheckoutRequest request, Order order) {
        var paymentsBySeller = cartItems.stream()
                .collect(Collectors.groupingBy(ci -> ci.getListing().getSeller().getId()));
        List<PaymentRequest> paymentRequests = new java.util.ArrayList<>();
        for (var entry : paymentsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            var items = entry.getValue();
            BigDecimal sellerTotal = items.stream()
                    .map(ci -> ci.getListing().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String sellerName = items.get(0).getListing().getSeller().getName();
            String sellerSurname = items.get(0).getListing().getSeller().getSurname();
            paymentRequests.add(PaymentRequest.builder()
                    .fromUserId(user.getId())
                    .toUserId(sellerId)
                    .receiverName(sellerName)
                    .receiverSurname(sellerSurname)
                    .listingId(null)
                    .amount(sellerTotal)
                    .paymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.CREDIT_CARD)
                    .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                    .paymentDirection(PaymentDirection.OUTGOING)
                    .build());
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return paymentService.createPurchasePayments(paymentRequests, authentication);
    }

    private void sendNotifications(User user, Order savedOrder, boolean allPaid) {
        if (allPaid) {
            try {
                OrderDto orderDto = orderMapper.toDto(savedOrder);
                emailService.sendOrderConfirmationEmail(user, orderDto);
                sendSellerNotifications(orderDto);
            } catch (Exception e) {
                log.warn("Order confirmation email could not be sent for order {}: {}", savedOrder.getOrderNumber(), e.getMessage());
            }
        }
    }

    private void sendSellerNotifications(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            return;
        }
        
        // Group order items by seller
        var itemsBySeller = orderDto.getOrderItems().stream()
                .filter(item -> item.getListing() != null && item.getListing().getSellerId() != null)
                .collect(Collectors.groupingBy(item -> item.getListing().getSellerId()));
        
        // Send notification to each seller
        for (var entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            var sellerItems = entry.getValue();
            
            try {
                User seller = userService.findById(sellerId);
                emailService.sendSaleNotificationEmail(seller, orderDto, sellerItems);
                log.info("Sale notification sent to seller {} for order {}", seller.getEmail(), orderDto.getOrderNumber());
            } catch (Exception e) {
                log.warn("Failed to send sale notification to seller {} for order {}: {}", sellerId, orderDto.getOrderNumber(), e.getMessage());
            }
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
