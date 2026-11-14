package com.serhat.secondhand.ewallet;

import com.serhat.secondhand.ewallet.dto.BalanceCheckDto;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class EWalletBalanceCheckTest {

    private final EWalletRepository repository = mock(EWalletRepository.class);
    private final EWalletValidator validator = new EWalletValidator(repository);

    private void walletWithBalance(String balance) {
        EWallet wallet = mock(EWallet.class);
        when(wallet.getBalance()).thenReturn(new BigDecimal(balance));
        when(repository.findByUserId(1L)).thenReturn(Optional.of(wallet));
    }

    @Test
    void sufficientBalance_reportsRemainingAfterPayment() {
        walletWithBalance("150.00");

        BalanceCheckDto check = validator.checkBalance(1L, new BigDecimal("100.00"));

        assertThat(check.sufficientBalance()).isTrue();
        assertThat(check.balanceAfterPayment()).isEqualByComparingTo("50.00");
        assertThat(check.shortfall()).isEqualByComparingTo("0");
    }

    @Test
    void insufficientBalance_reportsShortfall() {
        walletWithBalance("30.00");

        BalanceCheckDto check = validator.checkBalance(1L, new BigDecimal("100.00"));

        assertThat(check.sufficientBalance()).isFalse();
        assertThat(check.balanceAfterPayment()).isEqualByComparingTo("0");
        assertThat(check.shortfall()).isEqualByComparingTo("70.00");
    }

    @Test
    void missingWallet_countsAsZeroBalance() {
        when(repository.findByUserId(1L)).thenReturn(Optional.empty());

        BalanceCheckDto check = validator.checkBalance(1L, new BigDecimal("100.00"));

        assertThat(check.sufficientBalance()).isFalse();
        assertThat(check.shortfall()).isEqualByComparingTo("100.00");
    }
}
