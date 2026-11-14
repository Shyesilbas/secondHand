package com.serhat.secondhand.ewallet;

import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.ewallet.application.EWalletPaymentFactory;
import com.serhat.secondhand.ewallet.application.EWalletService;
import com.serhat.secondhand.ewallet.dto.EWalletDto;
import com.serhat.secondhand.ewallet.dto.EwalletRequest;
import com.serhat.secondhand.ewallet.dto.SpendingWarningCheckResponse;
import com.serhat.secondhand.ewallet.dto.UpdateLimitRequest;
import com.serhat.secondhand.ewallet.dto.WalletTransactionReference;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.mapper.EWalletMapper;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.payment.contract.PaymentTransactionKind;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EWalletServiceOperationsTest {

    @Mock private EWalletRepository eWalletRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private EWalletMapper eWalletMapper;
    @Mock private IUserService userService;
    @Mock private EWalletPaymentFactory paymentFactory;
    @Mock private ApplicationEventPublisher eventPublisher;

    private AppConfigProperties appConfigProperties;
    private EWalletValidator validator;
    private EWalletService service;
    private User user;
    private User seller;
    private EWallet wallet;

    @BeforeEach
    void setUp() {
        appConfigProperties = new AppConfigProperties();
        validator = new EWalletValidator(eWalletRepository);
        service = new EWalletService(
                eWalletRepository,
                paymentRepository,
                eWalletMapper,
                validator,
                userService,
                appConfigProperties,
                paymentFactory,
                eventPublisher
        );
        user = User.builder().id(5L).email("buyer@test.com").build();
        seller = User.builder().id(8L).email("seller@test.com").build();
        wallet = new EWallet();
        wallet.setUser(user);
        wallet.setBalance(new BigDecimal("250.00"));
        wallet.setWalletLimit(new BigDecimal("1000.00"));
        wallet.setSpendingWarningLimit(new BigDecimal("500.00"));
    }

    @Test
    void createEWallet_persistsWhenValidAndRejectsDuplicate() {
        when(userService.getAuthenticatedUser(any())).thenReturn(user);
        EwalletRequest req = new EwalletRequest(new BigDecimal("1000"), new BigDecimal("400"));
        EWalletDto dto = new EWalletDto(5L, BigDecimal.ZERO, new BigDecimal("1000"), new BigDecimal("400"));

        when(eWalletRepository.existsByUser(user)).thenReturn(false);
        when(eWalletMapper.fromCreateRequest(req, user)).thenReturn(wallet);
        when(eWalletRepository.save(wallet)).thenReturn(wallet);
        when(eWalletMapper.toDto(wallet)).thenReturn(dto);

        assertThat(service.createEWallet(req)).isEqualTo(dto);

        when(eWalletRepository.existsByUser(user)).thenReturn(true);
        assertThatThrownBy(() -> service.createEWallet(req))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(PaymentErrorCodes.EWALLET_EXISTS.getCode());
    }

    @Test
    void updateLimitsAndSpendingWarningLimit_scalesAndSaves() {
        when(userService.getAuthenticatedUser(any())).thenReturn(user);
        when(eWalletRepository.findByUser(user)).thenReturn(Optional.of(wallet));
        when(eWalletRepository.save(wallet)).thenReturn(wallet);
        when(eWalletMapper.toDto(wallet)).thenReturn(new EWalletDto());

        service.updateLimits(new UpdateLimitRequest(new BigDecimal("1500.5")));
        assertThat(wallet.getWalletLimit()).isEqualByComparingTo("1500.50");

        service.updateSpendingWarningLimit(new BigDecimal("350"));
        assertThat(wallet.getSpendingWarningLimit()).isEqualByComparingTo("350.00");

        service.removeSpendingWarningLimit();
        assertThat(wallet.getSpendingWarningLimit()).isNull();
    }

    @Test
    void checkSpendingWarning_triggersAtNinetyPercentThreshold() {
        when(userService.getAuthenticatedUser(any())).thenReturn(user);
        when(eWalletRepository.findByUser(user)).thenReturn(Optional.of(wallet));
        when(paymentRepository.sumMonthlyEwalletSpending(eq(5L), any())).thenReturn(new BigDecimal("450.00"));

        SpendingWarningCheckResponse response = service.checkSpendingWarning(new BigDecimal("20.00"));

        assertThat(response.warningTriggered()).isTrue();
        assertThat(response.projectedSpending()).isEqualByComparingTo("470.00");
        assertThat(response.usagePercentage()).isEqualTo(94.0);
    }

    @Test
    void processEWalletPayment_deductsBalanceOrReturnsFailureOnInsufficientFunds() {
        UUID listingId = UUID.randomUUID();
        when(eWalletRepository.findByUserWithLock(user)).thenReturn(Optional.of(wallet));

        PaymentResult success = service.processEWalletPayment(user, seller, new BigDecimal("100.00"), listingId);
        assertThat(success.success()).isTrue();
        assertThat(wallet.getBalance()).isEqualByComparingTo("150.00");

        PaymentResult insufficient = service.processEWalletPayment(user, seller, new BigDecimal("500.00"), listingId);
        assertThat(insufficient.success()).isFalse();
        assertThat(wallet.getBalance()).isEqualByComparingTo("150.00");
    }

    @Test
    void processEWalletPayment_propagatesDatabaseErrorsInsteadOfConvertingToPaymentFailure() {
        UUID listingId = UUID.randomUUID();
        when(eWalletRepository.findByUserWithLock(user))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("DB down"));

        assertThatThrownBy(() -> service.processEWalletPayment(user, seller, new BigDecimal("100.00"), listingId))
                .isInstanceOf(org.springframework.dao.DataAccessResourceFailureException.class);
    }

    @Test
    void creditToUser_withRefundPublishesPaymentCompletedEvent() {
        WalletTransactionReference ref = new WalletTransactionReference(UUID.randomUUID(), "Item", "LST-1", UUID.randomUUID(), 10L);
        Payment refundPayment = new Payment();
        when(eWalletRepository.findByUserWithLock(user)).thenReturn(Optional.of(wallet));
        when(paymentFactory.buildRefundPayment(seller, user, new BigDecimal("75.00"), ref)).thenReturn(refundPayment);

        service.creditToUser(user, new BigDecimal("75.00"), ref, PaymentTransactionKind.REFUND, seller);

        assertThat(wallet.getBalance()).isEqualByComparingTo("325.00");
        verify(paymentRepository).save(refundPayment);
        verify(eventPublisher).publishEvent(any(PaymentCompletedEvent.class));
    }

    @Test
    void debitFromUser_throwsWhenBalanceInsufficient() {
        WalletTransactionReference ref = new WalletTransactionReference(UUID.randomUUID(), "Item", "LST-2", UUID.randomUUID(), 11L);
        when(eWalletRepository.findByUserWithLock(seller)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> service.debitFromUser(seller, new BigDecimal("999.00"), ref, PaymentTransactionKind.REFUND, user))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE.getCode());
    }
}
