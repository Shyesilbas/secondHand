package com.serhat.secondhand.escrow;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxService;
import com.serhat.secondhand.ewallet.application.EWalletPaymentFactory;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.ewallet.dto.WalletTransactionReference;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.contract.PaymentTransactionKind;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EscrowRefundReferenceTest {

    private final EscrowRepository escrowRepository = mock(EscrowRepository.class);
    private final IEWalletService walletService = mock(IEWalletService.class);
    private final EscrowService service = new EscrowService(escrowRepository, mock(PaymentRepository.class),
            walletService, mock(ApplicationEventPublisher.class), mock(EscrowOutboxService.class));

    private final User buyer = User.builder().id(1L).build();
    private final User seller = User.builder().id(2L).build();
    private final UUID orderExternalId = UUID.randomUUID();
    private final UUID listingId = UUID.randomUUID();

    private Order order() {
        Order order = new Order();
        order.setUser(buyer);
        order.setExternalId(orderExternalId);
        order.setOrderNumber("ORD-TEST");
        return order;
    }

    private OrderItem item(Order order) {
        OrderItem item = new OrderItem();
        item.setId(44L);
        item.setOrder(order);
        return item;
    }

    private Escrow escrow(Order order, OrderItem item) {
        return Escrow.builder()
                .order(order)
                .orderItem(item)
                .seller(seller)
                .buyer(buyer)
                .amount(new BigDecimal("6900.00"))
                .status(PaymentStatus.ESCROW)
                .listingId(listingId)
                .listingTitle("Jersey")
                .listingNo("ABC123")
                .build();
    }

    private WalletTransactionReference capturedReference() {
        ArgumentCaptor<WalletTransactionReference> captor = ArgumentCaptor.forClass(WalletTransactionReference.class);
        verify(walletService).creditToUser(eq(buyer), eq(new BigDecimal("6900.00")), captor.capture(),
                eq(PaymentTransactionKind.REFUND), isNull());
        return captor.getValue();
    }

    @Test
    void refundCreditCarriesOrderAndOrderLine() {
        Order order = order();
        OrderItem item = item(order);
        when(escrowRepository.findByOrderItemIdInForUpdate(anyList())).thenReturn(List.of(escrow(order, item)));

        Result<Void> result = service.refund(order, List.of(item));

        assertThat(result.isError()).isFalse();
        WalletTransactionReference reference = capturedReference();
        assertThat(reference.orderExternalId()).isEqualTo(orderExternalId);
        assertThat(reference.orderItemId()).isEqualTo(44L);
        assertThat(reference.listingId()).isEqualTo(listingId);
    }

    @Test
    void cancelCreditCarriesOrderAndOrderLine() {
        Order order = order();
        OrderItem item = item(order);
        when(escrowRepository.findByOrderItemIdInForUpdate(anyList())).thenReturn(List.of(escrow(order, item)));

        Result<Void> result = service.cancel(order, List.of(item));

        assertThat(result.isError()).isFalse();
        WalletTransactionReference reference = capturedReference();
        assertThat(reference.orderExternalId()).isEqualTo(orderExternalId);
        assertThat(reference.orderItemId()).isEqualTo(44L);
    }

    @Test
    void refundPaymentRowStoresTheOrderLink() {
        WalletTransactionReference reference =
                new WalletTransactionReference(listingId, "Jersey", "ABC123", orderExternalId, 44L);

        Payment refund = new EWalletPaymentFactory().buildRefundPayment(seller, buyer, new BigDecimal("6900.00"), reference);

        assertThat(refund.getOrderId()).isEqualTo(orderExternalId);
        assertThat(refund.getOrderItemId()).isEqualTo(44L);
        assertThat(refund.getListingId()).isEqualTo(listingId);
    }
}
