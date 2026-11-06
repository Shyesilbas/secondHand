package com.serhat.secondhand.order.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCreationService {

    private final OrderRepository orderRepository;
    private final AddressService addressService;
    private final OrderLogService orderLog;

    /**
     * Creates one order per seller. Shipping, status and escrow are per order, so an order must never
     * mix sellers: each seller ships, cancels and gets paid for their own order. Amounts come from the
     * checkout pricing per item, so the orders together charge exactly the priced total.
     */
    public Result<List<Order>> createOrders(User user, List<Cart> cartItems, CheckoutRequest request, PricingResultDto pricing) {
        Result<Void> cartValidationResult = validateCartItems(cartItems);
        if (cartValidationResult.isError()) return cartValidationResult.propagateError();

        Address shippingAddress = resolveShippingAddress(request, user);
        Address billingAddress = resolveBillingAddress(request, user);

        Result<Void> addressValidationResult = validateAddresses(user, shippingAddress, billingAddress);
        if (addressValidationResult.isError()) return addressValidationResult.propagateError();

        Map<Long, List<Cart>> cartBySeller = new LinkedHashMap<>();
        for (Cart cart : cartItems) {
            Listing listing = cart.getListing();
            if (listing == null || listing.getSeller() == null || listing.getSeller().getId() == null) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_MISSING_SELLER);
            }
            cartBySeller.computeIfAbsent(listing.getSeller().getId(), id -> new ArrayList<>()).add(cart);
        }

        Map<UUID, PricedCartItemDto> pricedByListingId = buildPricedItemsByListingId(pricing);
        Map<UUID, BigDecimal> unitPriceByListingId = buildUnitPriceByListingId(pricing);
        Map<UUID, BigDecimal> lineSubtotalByListingId = buildLineSubtotalByListingId(pricing);

        List<Order> orders = new ArrayList<>();
        for (List<Cart> sellerCart : cartBySeller.values()) {
            SellerAmounts amounts = sellerAmounts(sellerCart, pricedByListingId);
            String orderNumber = generateOrderNumber();

            Order order = buildOrder(user, shippingAddress, billingAddress, amounts.total(), orderNumber, request);
            if (order.getDeliveryMethod() != DeliveryMethod.SAFE_MEETUP) {
                order.setShipping(buildShipping(order));
            }

            try {
                populateOrderItems(sellerCart, order, unitPriceByListingId, lineSubtotalByListingId);
            } catch (IllegalStateException e) {
                return Result.error(e.getMessage(), OrderErrorCodes.ORDER_ITEM_MISSING_SELLER.getCode());
            }

            // Set after the items: Order.addItem recalculates totals from item prices, which are already
            // net of the coupon share, and would subtract the coupon a second time.
            order.setTotalAmount(amounts.total());
            order.setSubtotal(amounts.subtotal());
            order.setCampaignDiscount(amounts.campaignDiscount());
            order.setCouponDiscount(amounts.couponDiscount());
            order.setCouponCode(amounts.couponDiscount().signum() > 0 && pricing != null ? pricing.getCouponCode() : null);
            order.setDiscountTotal(amounts.campaignDiscount().add(amounts.couponDiscount()));

            Order savedOrder = orderRepository.save(order);
            orderLog.logOrderCreated(orderNumber, savedOrder.getId(), user.getEmail());
            orders.add(savedOrder);
        }

        return Result.success(orders);
    }

    // Sums the priced lines of one seller; a line missing from pricing falls back to the listing price.
    private SellerAmounts sellerAmounts(List<Cart> sellerCart, Map<UUID, PricedCartItemDto> pricedByListingId) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal campaignDiscount = BigDecimal.ZERO;
        BigDecimal couponDiscount = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (Cart cart : sellerCart) {
            BigDecimal quantity = BigDecimal.valueOf(cart.getQuantity());
            PricedCartItemDto priced = pricedByListingId.get(cart.getListing().getId());
            if (priced == null || priced.getLineSubtotal() == null) {
                BigDecimal line = cart.getListing().getPrice().multiply(quantity);
                subtotal = subtotal.add(line);
                total = total.add(line);
                continue;
            }
            BigDecimal line = priced.getLineSubtotal();
            BigDecimal original = priced.getOriginalUnitPrice() != null ? priced.getOriginalUnitPrice().multiply(quantity) : line;
            BigDecimal coupon = priced.getCouponDiscount() != null ? priced.getCouponDiscount() : BigDecimal.ZERO;
            subtotal = subtotal.add(line);
            campaignDiscount = campaignDiscount.add(original.subtract(line).max(BigDecimal.ZERO));
            couponDiscount = couponDiscount.add(coupon);
            total = total.add(priced.getNetLineTotal() != null ? priced.getNetLineTotal() : line.subtract(coupon));
        }
        return new SellerAmounts(scale(subtotal), scale(campaignDiscount), scale(couponDiscount), scale(total));
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record SellerAmounts(BigDecimal subtotal, BigDecimal campaignDiscount, BigDecimal couponDiscount, BigDecimal total) {}

    private Result<Void> validateCartItems(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            return Result.error(OrderErrorCodes.CART_EMPTY);
        }
        return Result.success();
    }

    private Address resolveShippingAddress(CheckoutRequest request, User user) {
        return addressService.getAddressById(request.getShippingAddressId()).orElse(null);
    }

    private Address resolveBillingAddress(CheckoutRequest request, User user) {
        return request.getBillingAddressId() != null
                ? addressService.getAddressById(request.getBillingAddressId()).orElse(null)
                : null;
    }

    private Result<Void> validateAddresses(User user, Address shippingAddress, Address billingAddress) {
        if (shippingAddress == null || !shippingAddress.getUser().getId().equals(user.getId())) {
            return Result.error(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER);
        }

        if (billingAddress != null && !billingAddress.getUser().getId().equals(user.getId())) {
            return Result.error(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER);
        }

        return Result.success();
    }

    private void populateOrderItems(List<Cart> cartItems, Order order, Map<UUID, BigDecimal> unitPriceByListingId, Map<UUID, BigDecimal> lineSubtotalByListingId) {
        for (Cart cart : cartItems) {
            order.addItem(createOrderItem(cart, order, unitPriceByListingId, lineSubtotalByListingId));
        }
    }

    private OrderItem createOrderItem(Cart cart, Order order, Map<UUID, BigDecimal> unitPriceByListingId, Map<UUID, BigDecimal> lineSubtotalByListingId) {
        Listing listing = cart.getListing();
        BigDecimal unitPrice = listing != null ? listing.getPrice() : BigDecimal.ZERO;
        BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(cart.getQuantity()));

        if (listing != null && unitPriceByListingId != null) {
            unitPrice = unitPriceByListingId.getOrDefault(listing.getId(), unitPrice);
            if (lineSubtotalByListingId != null) {
                lineSubtotal = lineSubtotalByListingId.getOrDefault(listing.getId(), lineSubtotal);
            }
        }

        if (listing == null) {
            orderLog.logDataWarning("Cart item has no listing for order {}", order.getOrderNumber());
            throw new IllegalStateException("Cannot create order item: cart item has no listing");
        }

        User seller = listing.getSeller();
        ListingType listingType = listing.getListingType();

        OrderItem item = OrderItem.builder()
                .order(order)
                .listing(listing)
                .seller(seller)
                .listingType(listingType)
                .quantity(cart.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(lineSubtotal)
                .currency(Currency.TRY)
                .notes(cart.getNotes())
                .build();
        
        return item;
    }

    private Map<UUID, PricedCartItemDto> buildPricedItemsByListingId(PricingResultDto pricing) {
        if (pricing == null || pricing.getItems() == null) {
            return Map.of();
        }
        Map<UUID, PricedCartItemDto> map = new HashMap<>();
        for (PricedCartItemDto item : pricing.getItems()) {
            if (item.getListingId() != null) {
                map.put(item.getListingId(), item);
            }
        }
        return map;
    }

    private Map<UUID, BigDecimal> buildUnitPriceByListingId(PricingResultDto pricing) {
        if (pricing == null || pricing.getItems() == null) {
            return Map.of();
        }
        Map<UUID, BigDecimal> map = new HashMap<>();
        for (PricedCartItemDto item : pricing.getItems()) {
            if (item.getListingId() != null) {
                BigDecimal unitPrice = item.getNetUnitPrice() != null ? item.getNetUnitPrice() : item.getCampaignUnitPrice();
                if (unitPrice != null) {
                    map.put(item.getListingId(), unitPrice);
                }
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
            if (item.getListingId() != null) {
                BigDecimal lineSubtotal = item.getNetLineTotal() != null ? item.getNetLineTotal() : item.getLineSubtotal();
                if (lineSubtotal != null) {
                    map.put(item.getListingId(), lineSubtotal);
                }
            }
        }
        return map;
    }

    private Order buildOrder(User user, Address shippingAddress, Address billingAddress,
                             BigDecimal totalAmount, String orderNumber, CheckoutRequest request) {
        DeliveryMethod deliveryMethod = request.getDeliveryMethod() != null ? request.getDeliveryMethod() : DeliveryMethod.CARGO;
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .name(request.getName())
                .user(user)
                .totalAmount(totalAmount)
                .currency(Currency.TRY)
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .notes(request.getNotes())
                .deliveryMethod(deliveryMethod)
                .meetupLocation(request.getMeetupLocation())
                .build();
        
        if (deliveryMethod == DeliveryMethod.SAFE_MEETUP) {
            order.setStatus(OrderStatus.MEETUP_PENDING);
            order.generateVerificationCode();
        }
        return order;
    }

    private Shipping buildShipping(Order order) {
        return Shipping.builder()
                .order(order)
                .status(ShippingStatus.PENDING)
                .build();
    }

    private String generateOrderNumber() {
        return OrderBusinessConstants.ORDER_NUMBER_PREFIX
                + System.currentTimeMillis()
                + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
