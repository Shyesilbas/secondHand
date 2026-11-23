package com.serhat.secondhand.payment;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PaymentValidationHelperTest {

    private final IUserService userService = mock(IUserService.class);
    private final PaymentValidationHelper helper = new PaymentValidationHelper();
    private final User system = User.builder().id(99L).build();

    private PaymentRequest request(PaymentTransactionType type) {
        return PaymentRequest.builder().amount(new BigDecimal("10.00")).transactionType(type).toUserId(99L).build();
    }

    @ParameterizedTest
    @EnumSource(value = PaymentTransactionType.class, names = {"LISTING_CREATION", "SHOWCASE_PAYMENT", "MEMBERSHIP_PAYMENT", "SHIPPING_FEE"})
    void platformFeePaymentsResolveTheSystemAccountAsRecipient(PaymentTransactionType type) {
        when(userService.findById(99L)).thenReturn(Result.success(system));

        assertThat(helper.resolveToUser(request(type), userService)).isSameAs(system);
    }

    @Test
    void paymentWithoutRecipientResolvesNobody() {
        PaymentRequest request = PaymentRequest.builder().amount(BigDecimal.ONE)
                .transactionType(PaymentTransactionType.SHIPPING_FEE).build();

        assertThat(helper.resolveToUser(request, userService)).isNull();
    }
}
