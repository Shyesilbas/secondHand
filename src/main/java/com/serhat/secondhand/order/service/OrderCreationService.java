package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCreationService {

    private final OrderRepository orderRepository;
    private final AddressService addressService;

    /**
     * Creates a new order from cart items and checkout request
     */
    public Order createOrder(User user, List<Cart> cartItems, CheckoutRequest request) {
        log.info("Creating order for user: {}", user.getEmail());

        validateCartItems(cartItems);
        Address shippingAddress = resolveShippingAddress(request, user);
        Address billingAddress = resolveBillingAddress(request, user);
        
        validateAddresses(user, shippingAddress, billingAddress);

        BigDecimal totalAmount = calculateTotalAmount(cartItems);
        String orderNumber = generateOrderNumber();
        List<OrderItem> orderItems = createOrderItems(cartItems);

        Order order = buildOrder(user, shippingAddress, billingAddress, totalAmount, orderNumber, request.getNotes());
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and order number: {}", savedOrder.getId(), orderNumber);

        return savedOrder;
    }

    /**
     * Validates that cart items exist and are valid
     */
    private void validateCartItems(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BusinessException(OrderErrorCodes.CART_EMPTY);
        }
        log.debug("Validated {} cart items", cartItems.size());
    }

    /**
     * Resolves shipping address from request
     */
    private Address resolveShippingAddress(CheckoutRequest request, User user) {
        return addressService.getAddressById(request.getShippingAddressId());
    }

    /**
     * Resolves billing address from request (optional)
     */
    private Address resolveBillingAddress(CheckoutRequest request, User user) {
        return request.getBillingAddressId() != null 
            ? addressService.getAddressById(request.getBillingAddressId())
            : null;
    }

    /**
     * Validates that addresses belong to the user
     */
    private void validateAddresses(User user, Address shippingAddress, Address billingAddress) {
        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER);
        }
        
        if (billingAddress != null && !billingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER);
        }
        
        log.debug("Validated addresses for user: {}", user.getEmail());
    }

    /**
     * Calculates total amount from cart items
     */
    private BigDecimal calculateTotalAmount(List<Cart> cartItems) {
        return cartItems.stream()
                .map(cart -> cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Creates order items from cart items
     */
    private List<OrderItem> createOrderItems(List<Cart> cartItems) {
        return cartItems.stream()
                .map(this::createOrderItem)
                .collect(Collectors.toList());
    }

    /**
     * Creates a single order item from cart item
     */
    private OrderItem createOrderItem(Cart cart) {
        return OrderItem.builder()
                .listing(cart.getListing())
                .quantity(cart.getQuantity())
                .unitPrice(cart.getListing().getPrice())
                .totalPrice(cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .currency("TRY")
                .notes(cart.getNotes())
                .build();
    }

    /**
     * Builds the order entity
     */
    private Order buildOrder(User user, Address shippingAddress, Address billingAddress, 
                           BigDecimal totalAmount, String orderNumber, String notes) {
        return Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .currency("TRY")
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .shippingStatus(com.serhat.secondhand.order.entity.enums.ShippingStatus.PENDING)
                .notes(notes)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();
    }

    /**
     * Generates unique order number
     */
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
