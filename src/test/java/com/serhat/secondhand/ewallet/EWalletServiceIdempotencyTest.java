package com.serhat.secondhand.ewallet;

import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.application.EWalletPaymentFactory;
import com.serhat.secondhand.ewallet.application.EWalletService;
import com.serhat.secondhand.ewallet.dto.DepositRequest;
import com.serhat.secondhand.ewallet.dto.WithdrawRequest;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.mapper.EWalletMapper;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EWalletServiceIdempotencyTest {

    private static final String KEY = "key-1";

    private final EWalletRepository eWalletRepository = mock(EWalletRepository.class);
    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final EWalletValidator validator = mock(EWalletValidator.class);
    private final IUserService userService = mock(IUserService.class);
    private final EWalletPaymentFactory paymentFactory = mock(EWalletPaymentFactory.class);
    private EWalletService service;
    private EWallet wallet;
    private User user;

    @BeforeEach
    void setUp() {
        service = new EWalletService(eWalletRepository, paymentRepository, mock(EWalletMapper.class), validator,
                userService, mock(AppConfigProperties.class), paymentFactory, mock(ApplicationEventPublisher.class));
        user = new User();
        user.setId(5L);
        wallet = new EWallet();
        wallet.setBalance(new BigDecimal("100"));
        when(userService.getAuthenticatedUser(any())).thenReturn(user);
        when(eWalletRepository.findByUserWithLock(user)).thenReturn(Optional.of(wallet));
        when(validator.validateDeposit(any(), any())).thenReturn(Result.success());
        when(validator.validateWithdraw(any(), any())).thenReturn(Result.success());
        when(paymentFactory.buildDepositPayment(any(), any())).thenReturn(new Payment());
        when(paymentFactory.buildWithdrawalPayment(any(), any())).thenReturn(new Payment());
    }

    private static DepositRequest deposit(String amount) {
        DepositRequest request = new DepositRequest();
        request.setAmount(new BigDecimal(amount));
        return request;
    }

    private static Payment existing(PaymentTransactionType type, String amount) {
        Payment payment = new Payment();
        payment.setTransactionType(type);
        payment.setAmount(new BigDecimal(amount));
        return payment;
    }

    @Test
    void deposit_withoutKey_isRejectedBeforeTouchingTheWallet() {
        assertThatThrownBy(() -> service.deposit(deposit("10"), " "))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo("IDEMPOTENCY_KEY_REQUIRED");
        verifyNoInteractions(eWalletRepository, paymentRepository);
    }

    @Test
    void deposit_firstRequest_creditsWalletAndStoresKey() {
        when(paymentRepository.findByIdempotencyKeyAndFromUserId(KEY, 5L)).thenReturn(Optional.empty());

        service.deposit(deposit("10"), KEY);

        assertThat(wallet.getBalance()).isEqualByComparingTo("110");
        verify(paymentRepository).save(argThat(p -> KEY.equals(p.getIdempotencyKey())));
    }

    @Test
    void deposit_repeatedKey_isNoOp() {
        when(paymentRepository.findByIdempotencyKeyAndFromUserId(KEY, 5L))
                .thenReturn(Optional.of(existing(PaymentTransactionType.EWALLET_DEPOSIT, "10.00")));

        service.deposit(deposit("10"), KEY);

        assertThat(wallet.getBalance()).isEqualByComparingTo("100");
        verify(eWalletRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void sameKey_withOtherAmountOrOperation_isConflict() {
        when(paymentRepository.findByIdempotencyKeyAndFromUserId(KEY, 5L))
                .thenReturn(Optional.of(existing(PaymentTransactionType.EWALLET_DEPOSIT, "10")));

        assertThatThrownBy(() -> service.deposit(deposit("20"), KEY))
                .extracting("errorCode").isEqualTo("IDEMPOTENCY_KEY_CONFLICT");

        WithdrawRequest withdraw = new WithdrawRequest();
        withdraw.setAmount(new BigDecimal("10"));
        assertThatThrownBy(() -> service.withdraw(withdraw, KEY))
                .extracting("errorCode").isEqualTo("IDEMPOTENCY_KEY_CONFLICT");
        assertThat(wallet.getBalance()).isEqualByComparingTo("100");
    }
}
