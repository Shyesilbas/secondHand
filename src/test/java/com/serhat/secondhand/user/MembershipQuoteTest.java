package com.serhat.secondhand.user;

import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.ewallet.dto.BalanceCheckDto;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.user.application.MembershipService;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.dto.MembershipQuoteDto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class MembershipQuoteTest {

    @Test
    void quote_usesConfiguredPremiumPriceAndWalletBalanceCheck() {
        AppConfigProperties props = new AppConfigProperties();
        props.getMembership().setPremiumPrice(new BigDecimal("149.90"));
        props.getMembership().setPremiumDurationDays(30);
        IEWalletService eWalletService = mock(IEWalletService.class);
        when(eWalletService.checkBalance(7L, new BigDecimal("149.90")))
                .thenReturn(new BalanceCheckDto(false, BigDecimal.ZERO, new BigDecimal("49.90")));
        MembershipService service = new MembershipService(mock(UserRepository.class), mock(PaymentProcessor.class),
                mock(PaymentRequestFactory.class), props, eWalletService);

        MembershipQuoteDto quote = service.getUpgradeQuote(7L);

        assertThat(quote.price()).isEqualByComparingTo("149.90");
        assertThat(quote.durationDays()).isEqualTo(30);
        assertThat(quote.sufficientBalance()).isFalse();
        assertThat(quote.shortfall()).isEqualByComparingTo("49.90");
    }
}
