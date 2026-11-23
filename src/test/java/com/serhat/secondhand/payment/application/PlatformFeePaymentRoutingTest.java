package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.ewallet.adapter.in.EWalletPaymentProviderAdapter;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.user.application.SystemAccountService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Platform fees (cargo, listing, showcase, membership) are paid to the system account and credited to its wallet. */
class PlatformFeePaymentRoutingTest {

    private final User system = User.builder().id(99L).build();
    private final SystemAccountService systemAccountService = mock(SystemAccountService.class);
    private final PaymentRequestFactory factory = new PaymentRequestFactory(systemAccountService);

    private Order cargoOrder() {
        User buyer = User.builder().id(1L).build();
        Listing listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setTitle("Lamp");
        OrderItem item = new OrderItem();
        item.setListing(listing);
        Order order = new Order();
        order.setUser(buyer);
        order.setOrderItems(List.of(item));
        order.setShippingFee(new BigDecimal("49.90"));
        return order;
    }

    @Test
    void shippingFeeRequestGoesFromBuyerToSystemAccountWithoutAnOrderItem() {
        when(systemAccountService.getSystemUser()).thenReturn(system);
        Order order = cargoOrder();

        PaymentRequest request = factory.buildShippingFeePaymentRequest(
                order.getUser(), order, CheckoutRequest.builder().build(), "ORD-1", UUID.randomUUID());

        assertThat(request.transactionType()).isEqualTo(PaymentTransactionType.SHIPPING_FEE);
        assertThat(request.fromUserId()).isEqualTo(1L);
        assertThat(request.toUserId()).isEqualTo(99L);
        assertThat(request.orderItemId()).isNull();
        assertThat(request.amount()).isEqualByComparingTo("49.90");
        assertThat(request.idempotencyKey()).isEqualTo("ORD-1-shipping");
    }

    @Test
    void platformFeeTypesAreExactlyTheFourFeeFlows() {
        for (PaymentTransactionType type : PaymentTransactionType.values()) {
            boolean expected = type == PaymentTransactionType.LISTING_CREATION
                    || type == PaymentTransactionType.SHOWCASE_PAYMENT
                    || type == PaymentTransactionType.MEMBERSHIP_PAYMENT
                    || type == PaymentTransactionType.SHIPPING_FEE;
            assertThat(type.isPlatformFee()).as(type.name()).isEqualTo(expected);
        }
    }

    @Test
    void walletAdapterCreditsTheSystemWalletForPlatformFeesOnly() {
        IEWalletService wallet = mock(IEWalletService.class);
        EWalletPaymentProviderAdapter adapter = new EWalletPaymentProviderAdapter(wallet, mock(EWalletValidator.class));
        User buyer = User.builder().id(1L).build();
        BigDecimal amount = new BigDecimal("49.90");
        when(wallet.processEWalletPayment(any(), any(), any(), any())).thenReturn(PaymentResult.success("tx", new BigDecimal("49.90"), "EWALLET", null, 1L, 99L));

        adapter.process(buyer, system, amount, UUID.randomUUID(),
                PaymentRequest.builder().transactionType(PaymentTransactionType.SHIPPING_FEE).build());
        verify(wallet).creditWalletQuietly(system, amount);

        adapter.process(buyer, system, amount, UUID.randomUUID(),
                PaymentRequest.builder().transactionType(PaymentTransactionType.ITEM_PURCHASE).build());
        verify(wallet, org.mockito.Mockito.times(1)).creditWalletQuietly(any(), any());
    }
}
