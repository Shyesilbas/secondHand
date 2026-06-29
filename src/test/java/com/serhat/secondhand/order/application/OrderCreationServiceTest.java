package com.serhat.secondhand.order.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderCreationServiceTest {

    private OrderCreationService orderCreationService;

    private OrderRepository orderRepository;
    private AddressService addressService;
    private OrderLogService orderLogService;

    private User buyer;
    private User seller;
    private Address shippingAddress;
    private Address billingAddress;
    private List<Cart> cartItems;
    private CheckoutRequest checkoutRequest;
    private PricingResultDto pricingResult;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        addressService = mock(AddressService.class);
        orderLogService = mock(OrderLogService.class);

        orderCreationService = new OrderCreationService(orderRepository, addressService, orderLogService);

        buyer = new User();
        buyer.setId(1L);
        buyer.setEmail("buyer@test.com");

        seller = new User();
        seller.setId(2L);
        seller.setEmail("seller@test.com");

        shippingAddress = new Address();
        shippingAddress.setId(10L);
        shippingAddress.setUser(buyer);

        billingAddress = new Address();
        billingAddress.setId(11L);
        billingAddress.setUser(buyer);

        cartItems = new ArrayList<>();
        Cart cartItem = new Cart();
        cartItem.setQuantity(1);

        Listing listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setPrice(BigDecimal.valueOf(100));
        listing.setSeller(seller);
        listing.setListingType(ListingType.OTHER);
        listing.setTitle("Test Item");

        cartItem.setListing(listing);
        cartItems.add(cartItem);

        checkoutRequest = new CheckoutRequest();
        checkoutRequest.setShippingAddressId(10L);
        checkoutRequest.setBillingAddressId(11L);
        checkoutRequest.setName("John Doe");
        checkoutRequest.setNotes("Please leave at door");
        checkoutRequest.setDeliveryMethod(DeliveryMethod.CARGO);

        pricingResult = new PricingResultDto();
        pricingResult.setTotal(BigDecimal.valueOf(100));
        pricingResult.setSubtotalAfterCampaigns(BigDecimal.valueOf(100));
        pricingResult.setDiscountTotal(BigDecimal.valueOf(0));

        when(addressService.getAddressById(10L)).thenReturn(Optional.of(shippingAddress));
        when(addressService.getAddressById(11L)).thenReturn(Optional.of(billingAddress));
    }

    @Test
    void createOrder_ShouldReturnError_WhenCartIsEmpty() {
        Result<Order> result = orderCreationService.createOrder(buyer, new ArrayList<>(), checkoutRequest, pricingResult);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.CART_EMPTY.getCode(), result.getErrorCode());
    }

    @Test
    void createOrder_ShouldReturnError_WhenShippingAddressNotBelongToUser() {
        User differentUser = new User();
        differentUser.setId(99L);
        shippingAddress.setUser(differentUser);

        Result<Order> result = orderCreationService.createOrder(buyer, cartItems, checkoutRequest, pricingResult);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ADDRESS_NOT_BELONG_TO_USER.getCode(), result.getErrorCode());
    }

    @Test
    void createOrder_ShouldReturnError_WhenBillingAddressNotBelongToUser() {
        User differentUser = new User();
        differentUser.setId(99L);
        billingAddress.setUser(differentUser);

        Result<Order> result = orderCreationService.createOrder(buyer, cartItems, checkoutRequest, pricingResult);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.BILLING_ADDRESS_NOT_BELONG_TO_USER.getCode(), result.getErrorCode());
    }

    @Test
    void createOrder_ShouldCreateCargoOrder_WhenDeliveryMethodIsCargo() {
        checkoutRequest.setDeliveryMethod(DeliveryMethod.CARGO);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Result<Order> result = orderCreationService.createOrder(buyer, cartItems, checkoutRequest, pricingResult);

        assertTrue(result.isSuccess());
        Order order = result.getData();
        assertNotNull(order);
        assertEquals(DeliveryMethod.CARGO, order.getDeliveryMethod());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertNotNull(order.getShipping());
        assertEquals(BigDecimal.valueOf(100), order.getTotalAmount());
        verify(orderRepository).save(any(Order.class));
        verify(orderLogService).logOrderCreated(anyString(), any(), eq(buyer.getEmail()));
    }

    @Test
    void createOrder_ShouldCreateSafeMeetupOrder_WhenDeliveryMethodIsSafeMeetup() {
        checkoutRequest.setDeliveryMethod(DeliveryMethod.SAFE_MEETUP);
        checkoutRequest.setMeetupLocation("Bebek Parkı");
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Result<Order> result = orderCreationService.createOrder(buyer, cartItems, checkoutRequest, pricingResult);

        assertTrue(result.isSuccess());
        Order order = result.getData();
        assertNotNull(order);
        assertEquals(DeliveryMethod.SAFE_MEETUP, order.getDeliveryMethod());
        assertEquals(OrderStatus.MEETUP_PENDING, order.getStatus());
        assertEquals("Bebek Parkı", order.getMeetupLocation());
        assertNull(order.getShipping());
        assertNotNull(order.getMeetupVerificationCodeHash());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_ShouldThrowException_WhenListingIsNull() {
        cartItems.get(0).setListing(null);

        Result<Order> result = orderCreationService.createOrder(buyer, cartItems, checkoutRequest, pricingResult);
        assertTrue(result.isError());
        verifyNoInteractions(orderRepository);
    }
}
