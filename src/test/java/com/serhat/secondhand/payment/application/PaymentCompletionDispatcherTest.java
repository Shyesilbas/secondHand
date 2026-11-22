package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentCompletionDispatcherTest {

    @Test
    void sellerReceipt_showsBuyerPaidPlusPlatformCouponShare() {
        PaymentNotificationService notifications = mock(PaymentNotificationService.class);
        PaymentMapper mapper = mock(PaymentMapper.class);
        EscrowRepository escrowRepository = mock(EscrowRepository.class);
        PaymentCompletionDispatcher dispatcher = new PaymentCompletionDispatcher(
                mock(PaymentCompletedHandlerRegistry.class), notifications, mapper, escrowRepository);

        User seller = User.builder().id(2L).build();
        Payment payment = Payment.builder().toUser(seller).orderItemId(55L)
                .transactionType(PaymentTransactionType.ITEM_SALE).amount(new BigDecimal("95.00")).build();
        when(mapper.toDto(payment)).thenReturn(new PaymentDto(null, "b", "s", new BigDecimal("95.00"), "TRY",
                "EWALLET", null, PaymentTransactionType.ITEM_SALE, PaymentDirection.INCOMING, null, null, null,
                null, PaymentStatus.COMPLETED, true, null));
        when(escrowRepository.findByOrderItemId(55L)).thenReturn(Optional.of(
                Escrow.builder().platformSubsidy(new BigDecimal("5.00")).build()));

        dispatcher.dispatch(payment);

        ArgumentCaptor<PaymentDto> sent = ArgumentCaptor.forClass(PaymentDto.class);
        verify(notifications).sendPaymentSuccessNotification(any(), sent.capture());
        assertThat(sent.getValue().amount()).isEqualByComparingTo("100.00");
    }
}
