package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.listing.application.port.ListingFeePaymentPort;
import com.serhat.secondhand.listing.validation.common.ListingFeePaymentValidation;
import com.serhat.secondhand.payment.dto.ListingFeeQuoteDto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ListingFeeQuoteTest {

    @Test
    void quote_usesServerFeeAndWalletBalanceCheck() {
        ListingCommandService commandService = mock(ListingCommandService.class);
        IEWalletService eWalletService = mock(IEWalletService.class);
        ListingFeePaymentService service = new ListingFeePaymentService(mock(ListingConfig.class),
                mock(ListingFeePaymentValidation.class), commandService, mock(ListingFeePaymentPort.class), eWalletService);
        BigDecimal fee = new BigDecimal("120.00");
        when(commandService.calculateTotalListingFee()).thenReturn(fee);
        when(eWalletService.hasSufficientBalance(5L, fee)).thenReturn(false);

        ListingFeeQuoteDto quote = service.getListingFeeQuote(5L);

        assertThat(quote.totalFee()).isEqualByComparingTo("120.00");
        assertThat(quote.sufficientBalance()).isFalse();
    }
}
