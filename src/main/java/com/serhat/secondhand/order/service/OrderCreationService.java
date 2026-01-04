package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.Shipping;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCreationService {

    private final OrderRepository orderRepository;
    private final AddressService addressService;

        public Order createOrder(User user, List<Cart> cartItems, CheckoutRequest request, PricingResultDto pricing) {
        log.info("Creating order for user: {}", user.getEmail());

        validateCartItems(cartItems);
        Address shippingAddress = resolveShippingAddress(request, user);
        Address billingAddress = resolveBillingAddress(request, user);

        validateAddresses(user, shippingAddress, billingAddress);

        BigDecimal totalAmount = pricing != null && pricing.getTotal() != null ? pricing.getTotal() : calculateTotalAmount(cartItems);
        BigDecimal subtotal = pricing != null ? pricing.getSubtotalAfterCampaigns() : null;
        BigDecimal campaignDiscount = pricing != null ? pricing.getCampaignDiscount() : null;
        BigDecimal couponDiscount = pricing != null ? pricing.getCouponDiscount() : null;
        BigDecimal discountTotal = pricing != null ? pricing.getDiscountTotal() : null;
        String couponCode = pricing != null ? pricing.getCouponCode() : null;
        String orderNumber = generateOrderNumber();
        
        Order order = buildOrder(user, shippingAddress, billingAddress, totalAmount, orderNumber, request.getNotes(), request.getName());
        order.setSubtotal(subtotal);
        order.setCampaignDiscount(campaignDiscount);
        order.setCouponCode(couponCode);
        order.setCouponDiscount(couponDiscount);
        order.setDiscountTotal(discountTotal);

        Shipping shipping = buildShipping(order);
        order.setShipping(shipping);

        Map<UUID, BigDecimal> unitPriceByListingId = buildUnitPriceByListingId(pricing);
        Map<UUID, BigDecimal> lineSubtotalByListingId = buildLineSubtotalByListingId(pricing);
        List<OrderItem> orderItems = createOrderItems(cartItems, order, unitPriceByListingId, lineSubtotalByListingId);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and order number: {}", savedOrder.getId(), orderNumber);

        return savedOrder;
    }

        private void validateCartItems(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BusinessException(OrderErrorCodes.CART_EMPTY);
        }
        log.debug("Validated {} cart items", cartItems.size());
    }

        private Address resolveShippingAddress(CheckoutRequest request, User user) {
        return addressService.getAddressById(request.getShippingAddressId());
    }

        private Address resolveBillingAddress(CheckoutRequest request, User user) {
        return request.getBillingAddressId() != null 
            ? addressService.getAddressById(request.getBillingAddressId())
            : null;
    }

        private void validateAddresses(User user, Address shippingAddress, Address billingAddress) {
        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER);
        }
        
        if (billingAddress != null && !billingAddress.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER);
        }
        
        log.debug("Validated addresses for user: {}", user.getEmail());
    }

        private BigDecimal calculateTotalAmount(List<Cart> cartItems) {
        return cartItems.stream()
                .map(cart -> cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

        private List<OrderItem> createOrderItems(List<Cart> cartItems, Order order, Map<UUID, BigDecimal> unitPriceByListingId, Map<UUID, BigDecimal> lineSubtotalByListingId) {
        return cartItems.stream()
                .map(cart -> createOrderItem(cart, order, unitPriceByListingId, lineSubtotalByListingId))
                .collect(Collectors.toList());
    }

        private OrderItem createOrderItem(Cart cart, Order order, Map<UUID, BigDecimal> unitPriceByListingId, Map<UUID, BigDecimal> lineSubtotalByListingId) {
        BigDecimal unitPrice = cart.getListing() != null ? cart.getListing().getPrice() : BigDecimal.ZERO;
        BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(cart.getQuantity()));
        if (cart.getListing() != null && unitPriceByListingId != null) {
            unitPrice = unitPriceByListingId.getOrDefault(cart.getListing().getId(), unitPrice);
            if (lineSubtotalByListingId != null) {
                lineSubtotal = lineSubtotalByListingId.getOrDefault(cart.getListing().getId(), lineSubtotal);
            }
        }
        return OrderItem.builder()
                .order(order)
                .listing(cart.getListing())
                .quantity(cart.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(lineSubtotal)
                .currency("TRY")
                .notes(cart.getNotes())
                .build();
    }

    private Map<UUID, BigDecimal> buildUnitPriceByListingId(PricingResultDto pricing) {
        if (pricing == null || pricing.getItems() == null) {
            return Map.of();
        }
        Map<UUID, BigDecimal> map = new HashMap<>();
        for (PricedCartItemDto item : pricing.getItems()) {
            if (item.getListingId() != null && item.getCampaignUnitPrice() != null) {
                map.put(item.getListingId(), item.getCampaignUnitPrice());
            }
        }
        return map;
    }

    private Map<UUID, BigDecimal> buildLineSubtotalByListingId(PricingResultDto pricing) {
        if (pricing == null || pricing.getItems() == null) {
            return Map.of();
        }
        Map<UUID, BigDecimal> map = new HashMap<>();
        for (PricedCartItemDto item : pricing.getItems()) {
            if (item.getListingId() != null && item.getLineSubtotal() != null) {
                map.put(item.getListingId(), item.getLineSubtotal());
            }
        }
        return map;
    }

        private Order buildOrder(User user, Address shippingAddress, Address billingAddress, 
                           BigDecimal totalAmount, String orderNumber, String notes, String name) {
        return Order.builder()
                .orderNumber(orderNumber)
                .name(name)
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .currency("TRY")
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .notes(notes)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();
    }

    private Shipping buildShipping(Order order) {
        return Shipping.builder()
                .order(order)
                .status(ShippingStatus.PENDING)
                .build();
    }

        private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
