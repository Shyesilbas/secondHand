package com.serhat.secondhand.order;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderCreationServiceTest {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final AddressService addressService = mock(AddressService.class);
    private final OrderCreationService service =
            new OrderCreationService(orderRepository, addressService, mock(OrderLogService.class));

    private final User buyer = user(1L);

    private static User user(long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private static Cart cart(User seller, String price, int quantity) {
        Listing listing = Listing.builder().id(UUID.randomUUID()).seller(seller).price(new BigDecimal(price)).build();
        return Cart.builder().listing(listing).quantity(quantity).build();
    }

    private static PricedCartItemDto priced(Cart cart, String original, String line, String coupon, String net) {
        return PricedCartItemDto.builder()
                .listingId(cart.getListing().getId())
                .sellerId(cart.getListing().getSeller().getId())
                .quantity(cart.getQuantity())
                .originalUnitPrice(new BigDecimal(original))
                .lineSubtotal(new BigDecimal(line))
                .couponDiscount(new BigDecimal(coupon))
                .netLineTotal(new BigDecimal(net))
                .build();
    }

    @Test
    void cartWithTwoSellers_becomesOneOrderPerSeller_withTheirOwnAmounts() {
        Address address = mock(Address.class);
        when(address.getUser()).thenReturn(buyer);
        when(addressService.getAddressById(10L)).thenReturn(Optional.of(address));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        User sellerA = user(2L);
        User sellerB = user(3L);
        Cart a1 = cart(sellerA, "100", 1);
        Cart a2 = cart(sellerA, "50", 2);
        Cart b1 = cart(sellerB, "200", 1);
        PricingResultDto pricing = PricingResultDto.builder()
                .couponCode("SAVE10")
                .items(List.of(
                        priced(a1, "100", "90", "9", "81"),
                        priced(a2, "50", "100", "10", "90"),
                        priced(b1, "200", "200", "0", "200")))
                .build();
        CheckoutRequest request = CheckoutRequest.builder().shippingAddressId(10L).build();

        Result<List<Order>> result = service.createOrders(buyer, List.of(a1, b1, a2), request, pricing);

        assertThat(result.isError()).isFalse();
        List<Order> orders = result.getData();
        assertThat(orders).hasSize(2);

        Order orderA = orders.get(0);
        assertThat(orderA.getOrderItems()).extracting(OrderItem::getSeller).containsOnly(sellerA);
        assertThat(orderA.getTotalAmount()).isEqualByComparingTo("171");
        assertThat(orderA.getSubtotal()).isEqualByComparingTo("190");
        assertThat(orderA.getCampaignDiscount()).isEqualByComparingTo("10");
        assertThat(orderA.getCouponDiscount()).isEqualByComparingTo("19");
        assertThat(orderA.getCouponCode()).isEqualTo("SAVE10");
        assertThat(orderA.getShipping()).isNotNull();

        Order orderB = orders.get(1);
        assertThat(orderB.getOrderItems()).extracting(OrderItem::getSeller).containsOnly(sellerB);
        assertThat(orderB.getTotalAmount()).isEqualByComparingTo("200");
        assertThat(orderB.getCouponCode()).isNull();
        assertThat(orderA.getOrderNumber()).isNotEqualTo(orderB.getOrderNumber());
    }
}
