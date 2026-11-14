package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.ewallet.dto.BalanceCheckDto;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.showcase.application.ShowcasePricingCalculator;
import com.serhat.secondhand.showcase.application.ShowcaseRedisManagerService;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import com.serhat.secondhand.showcase.dto.ShowcaseQuoteDto;
import com.serhat.secondhand.showcase.repository.ShowcaseRepository;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.PlanValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ShowcasePricingTest {

    private ShowcaseConfig config;
    private ShowcasePricingCalculator calculator;
    private IEWalletService eWalletService;
    private ShowcaseService service;

    @BeforeEach
    void setUp() {
        config = new ShowcaseConfig();
        ShowcaseConfig.Daily daily = new ShowcaseConfig.Daily();
        daily.setCost(new BigDecimal("10.00"));
        ShowcaseConfig.Fee fee = new ShowcaseConfig.Fee();
        fee.setTax(new BigDecimal("18"));
        config.setDaily(daily);
        config.setFee(fee);
        calculator = new ShowcasePricingCalculator(config);
        eWalletService = mock(IEWalletService.class);
        service = new ShowcaseService(config, mock(ShowcaseRepository.class), mock(ShowcaseMapper.class),
                mock(ListingQueryService.class), mock(PaymentProcessor.class), mock(IUserService.class),
                new ShowcaseValidator(config), mock(PaymentRequestFactory.class), mock(PlanValidator.class),
                mock(ShowcaseRedisManagerService.class), calculator, eWalletService);
    }

    @Test
    void calculator_totalIsDailyCostWithTaxTimesDays_andPartsAddUp() {
        assertThat(calculator.dailyCostWithTax()).isEqualByComparingTo("11.80");
        assertThat(calculator.totalCost(7)).isEqualByComparingTo("82.60");
        assertThat(calculator.subtotal(7)).isEqualByComparingTo("70.00");
        assertThat(calculator.taxAmount(7)).isEqualByComparingTo("12.60");
        assertThat(calculator.subtotal(7).add(calculator.taxAmount(7))).isEqualByComparingTo(calculator.totalCost(7));
    }

    @Test
    void quotes_arePricedOnServerWithBalanceCheckPerDuration() {
        when(eWalletService.checkBalance(eq(5L), any())).thenAnswer(inv -> {
            BigDecimal amount = inv.getArgument(1);
            BigDecimal balance = new BigDecimal("100.00");
            boolean ok = balance.compareTo(amount) >= 0;
            return new BalanceCheckDto(ok, ok ? balance.subtract(amount) : BigDecimal.ZERO,
                    ok ? BigDecimal.ZERO : amount.subtract(balance));
        });

        Result<List<ShowcaseQuoteDto>> result = service.getShowcaseQuotes(5L, List.of(14, 7, 7));

        assertThat(result.isSuccess()).isTrue();
        List<ShowcaseQuoteDto> quotes = result.getData();
        assertThat(quotes).extracting(ShowcaseQuoteDto::days).containsExactly(7, 14);
        assertThat(quotes.get(0).totalCost()).isEqualByComparingTo("82.60");
        assertThat(quotes.get(0).sufficientBalance()).isTrue();
        assertThat(quotes.get(0).balanceAfterPayment()).isEqualByComparingTo("17.40");
        assertThat(quotes.get(1).totalCost()).isEqualByComparingTo("165.20");
        assertThat(quotes.get(1).sufficientBalance()).isFalse();
        assertThat(quotes.get(1).shortfall()).isEqualByComparingTo("65.20");
    }

    @Test
    void quotes_rejectDurationsOutsideConfiguredRange() {
        Result<List<ShowcaseQuoteDto>> result = service.getShowcaseQuotes(5L, List.of(7, 31));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ShowcaseErrorCodes.INVALID_DAYS_COUNT.getCode());
        verifyNoInteractions(eWalletService);
    }
}
