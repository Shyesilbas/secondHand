package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.dto.MembershipUpgradeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PaymentRequestFactoryTest {

    private PaymentRequestFactory factory;
    private User buyer;
    private User seller;
    private Order order;
    private OrderItem item1;
    private OrderItem item2;
    private Listing listing1;
    private Listing listing2;

    @BeforeEach
    void setUp() {
        factory = new PaymentRequestFactory();

        buyer = new User();
        buyer.setId(1L);

        seller = new User();
        seller.setId(2L);

        listing1 = new Listing();
        listing1.setId(UUID.randomUUID());
        listing1.setPrice(BigDecimal.valueOf(40));
        listing1.setCurrency(Currency.TRY);
        listing1.setTitle("Listing 1");

        listing2 = new Listing();
        listing2.setId(UUID.randomUUID());
        listing2.setPrice(BigDecimal.valueOf(60));
        listing2.setCurrency(Currency.TRY);
        listing2.setTitle("Listing 2");

        order = new Order();
        order.setId(100L);
        order.setTotalAmount(BigDecimal.valueOf(90)); // Total with 10% discount

        item1 = new OrderItem();
        item1.setId(10L);
        item1.setTotalPrice(BigDecimal.valueOf(40));
        item1.setListing(listing1);
        item1.setSeller(seller);
        item1.setOrder(order);

        item2 = new OrderItem();
        item2.setId(11L);
        item2.setTotalPrice(BigDecimal.valueOf(60));
        item2.setListing(listing2);
        item2.setSeller(seller);
        item2.setOrder(order);

        order.setOrderItems(List.of(item1, item2));
    }

    @Test
    void buildOrderPaymentRequests_ShouldSplitAmountsProportionally_AndApplyRemainingToLastItem() {
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setPaymentType(PaymentType.EWALLET);
        checkoutRequest.setAgreementsAccepted(true);

        PricingResultDto pricing = new PricingResultDto();
        pricing.setTotal(BigDecimal.valueOf(90));

        UUID orderExtId = UUID.randomUUID();

        List<PaymentRequest> requests = factory.buildOrderPaymentRequests(
                buyer, order, checkoutRequest, pricing, "ORD-999", orderExtId
        );

        assertNotNull(requests);
        assertEquals(2, requests.size());

        // Proportion check:
        // totalOriginal = 100, totalPaid = 90
        // item1 (40) -> 90 * 40 / 100 = 36.00
        // item2 (60) -> 90 - 36.00 = 54.00
        PaymentRequest req1 = requests.get(0);
        assertEquals(new BigDecimal("36.00"), req1.amount());
        assertEquals(item1.getId(), req1.orderItemId());
        assertEquals(PaymentTransactionType.ITEM_PURCHASE, req1.transactionType());
        assertEquals(PaymentDirection.OUTGOING, req1.paymentDirection());

        PaymentRequest req2 = requests.get(1);
        assertEquals(new BigDecimal("54.00"), req2.amount());
        assertEquals(item2.getId(), req2.orderItemId());
        assertEquals(orderExtId, req2.orderId());
    }

    @Test
    void buildShowcasePaymentRequest_ShouldMapCorrectly() {
        ShowcasePaymentRequest request = new ShowcasePaymentRequest(
                UUID.randomUUID(),
                5,
                PaymentType.EWALLET,
                "123456",
                true,
                List.of(UUID.randomUUID()),
                "opt-key"
        );

        PaymentRequest req = factory.buildShowcasePaymentRequest(buyer, listing1, request, BigDecimal.TEN);

        assertNotNull(req);
        assertEquals(buyer.getId(), req.fromUserId());
        assertNull(req.toUserId());
        assertEquals(BigDecimal.TEN, req.amount());
        assertEquals(PaymentTransactionType.SHOWCASE_PAYMENT, req.transactionType());
        assertEquals(PaymentDirection.OUTGOING, req.paymentDirection());
    }

    @Test
    void buildMembershipPaymentRequest_ShouldMapCorrectly() {
        MembershipUpgradeRequest request = new MembershipUpgradeRequest(
                true,
                List.of(UUID.randomUUID()),
                "OTP123",
                "idemp-key"
        );

        PaymentRequest req = factory.buildMembershipPaymentRequest(buyer, BigDecimal.valueOf(19), PaymentType.EWALLET, "idemp-key", request);

        assertNotNull(req);
        assertEquals(buyer.getId(), req.fromUserId());
        assertEquals(BigDecimal.valueOf(19), req.amount());
        assertEquals(PaymentTransactionType.MEMBERSHIP_PAYMENT, req.transactionType());
        assertEquals("idemp-key", req.idempotencyKey());
        assertEquals("OTP123", req.verificationCode());
    }
}
