package com.serhat.secondhand.ewallet.application;

import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.mapper.EWalletMapper;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.util.EWalletBalanceUtil;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.payment.bank.BankService;
import com.serhat.secondhand.payment.entity.*;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EWalletService implements IEWalletService {

    private final EWalletRepository eWalletRepository;
    private final BankService bankService;
    private final PaymentRepository paymentRepository;
    private final EWalletMapper eWalletMapper;
    private final EWalletValidator eWalletValidator;
    private final IUserService userService;
    private final AppConfigProperties appConfigProperties;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Transactional
    public EWalletDto createEWallet(EwalletRequest ewalletRequest) {
        User user = getAuthenticatedUser();
        log.info("Creating eWallet for user: {}", user.getEmail());

        ensureValid(eWalletValidator.validateEWalletNotExists(user));
        ensureValid(eWalletValidator.validateWalletLimit(ewalletRequest.limit()));
        ensureValid(eWalletValidator.validateSpendingWarningLimit(ewalletRequest.spendingWarningLimit()));

        EWallet eWallet = eWalletMapper.fromCreateRequest(ewalletRequest, user);
        eWallet = eWalletRepository.save(eWallet);

        log.info("eWallet created for user: {} with ID: {}", user.getEmail(), eWallet.getId());
        return eWalletMapper.toDto(eWallet);
    }

    @Transactional(readOnly = true)
    public EWalletDto getEWalletByUserId() {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);
        return eWalletMapper.toDto(eWallet);
    }

    @Transactional
    public void updateSpendingWarningLimit(BigDecimal spendingWarningLimit) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);

        ensureValid(eWalletValidator.validateSpendingWarningLimit(spendingWarningLimit));

        eWallet.setSpendingWarningLimit(EWalletBalanceUtil.scale(spendingWarningLimit));
        eWalletRepository.save(eWallet);

        log.info("eWallet spending warning limit updated for user: {} new limit: {}", user.getEmail(), spendingWarningLimit);
    }

    @Transactional
    public void removeSpendingWarningLimit() {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);
        eWallet.setSpendingWarningLimit(null);
        eWalletRepository.save(eWallet);
        log.info("eWallet spending warning limit removed for user: {}", user.getEmail());
    }

    @Transactional
    @CacheEvict(value = "paymentStats", allEntries = true)
    public void deposit(DepositRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrowWithLock(user);

        ensureValid(eWalletValidator.validateDeposit(eWallet, request.getAmount()));

        Bank bank = bankService.findByUser(user).orElse(null);
        ensureValid(eWalletValidator.validateBankAccount(bank, request.getBankId()));

        bankService.debit(user, request.getAmount());

        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), request.getAmount()));
        eWalletRepository.save(eWallet);

        Payment payment = buildDepositPayment(user, request.getAmount());
        paymentRepository.save(payment);
        eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
        log.info("eWallet deposit successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    @CacheEvict(value = "paymentStats", allEntries = true)
    public void withdraw(WithdrawRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrowWithLock(user);

        ensureValid(eWalletValidator.validateWithdraw(eWallet, request.getAmount()));

        Bank bank = bankService.findByUser(user).orElse(null);
        ensureValid(eWalletValidator.validateBankAccount(bank, request.getBankId()));

        eWallet.setBalance(EWalletBalanceUtil.subtract(eWallet.getBalance(), request.getAmount()));
        eWalletRepository.save(eWallet);

        bankService.credit(user, request.getAmount());

        Payment payment = buildWithdrawalPayment(user, request.getAmount());
        paymentRepository.save(payment);
        eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
        log.info("eWallet withdrawal successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    public EWalletDto updateLimits(UpdateLimitRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);

        ensureValid(eWalletValidator.validateWalletLimit(request.getNewLimit()));

        eWallet.setWalletLimit(EWalletBalanceUtil.scale(request.getNewLimit()));
        eWallet = eWalletRepository.save(eWallet);

        log.info("eWallet limit updated for user: {} new limit: {}", user.getEmail(), request.getNewLimit());
        return eWalletMapper.toDto(eWallet);
    }

    @Transactional(readOnly = true)
    public boolean hasSufficientBalance(BigDecimal amount) {
        User user = getAuthenticatedUser();
        return eWalletValidator.hasSufficientBalance(user, amount);
    }

    @Transactional(readOnly = true)
    public SpendingWarningCheckResponse checkSpendingWarning(BigDecimal amount) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);

        if (eWallet.getSpendingWarningLimit() == null) {
            return new SpendingWarningCheckResponse(false, BigDecimal.ZERO, null, amount, 0.0);
        }

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        BigDecimal currentSpending = paymentRepository.sumMonthlyEwalletSpending(user.getId(), startOfMonth);
        if (currentSpending == null) {
            currentSpending = BigDecimal.ZERO;
        }
        BigDecimal projectedSpending = currentSpending.add(amount);
        BigDecimal warningLimit = eWallet.getSpendingWarningLimit();

        BigDecimal ninetyPercentLimit = warningLimit.multiply(appConfigProperties.getEWallet().getSpendingWarningThreshold());
        
        boolean currentNearLimit = currentSpending.compareTo(ninetyPercentLimit) >= 0;
        boolean willExceedLimit = projectedSpending.compareTo(warningLimit) >= 0;
        
        boolean warningTriggered = currentNearLimit || willExceedLimit;

        double usagePercentage = 0.0;
        if (warningLimit.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = projectedSpending.divide(warningLimit, 4, RoundingMode.HALF_UP).doubleValue() * 100;
        }

        return new SpendingWarningCheckResponse(
            warningTriggered,
            currentSpending,
            warningLimit,
            projectedSpending,
            usagePercentage
        );
    }

    @Transactional(readOnly = true)
    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        return eWalletValidator.hasSufficientBalance(user, amount);
    }

    @Transactional
    public PaymentResult processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        if (fromUser == null) {
            return PaymentResult.failure("User not found", amount, PaymentType.EWALLET, listingId, null,
                    toUser != null ? toUser.getId() : null);
        }

        try {
            log.info("Starting eWallet payment: {} -> {} amount: {} listing: {}",
                    fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM", amount, listingId);

            EWallet fromWallet = getEWalletOrThrowWithLock(fromUser);
            log.info("Payer wallet balance: {}", fromWallet.getBalance());

            ensureValid(eWalletValidator.validateSufficientBalance(fromWallet, amount));

            fromWallet.setBalance(EWalletBalanceUtil.subtract(fromWallet.getBalance(), amount));
            eWalletRepository.save(fromWallet);

            log.info("Deducted {} from payer wallet. New balance: {}", amount, fromWallet.getBalance());

            return PaymentResult.success(
                    UUID.randomUUID().toString(),
                    amount,
                    PaymentType.EWALLET,
                    listingId,
                    fromUser.getId(),
                    toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            log.error("Error processing eWallet payment for user: {}", fromUser.getEmail(), e);
            return PaymentResult.failure(
                    e.getMessage(),
                    amount,
                    PaymentType.EWALLET,
                    listingId,
                    fromUser.getId(),
                    toUser != null ? toUser.getId() : null);
        }
    }

    @Transactional
    public void creditToUser(User user, BigDecimal amount) {
        creditToUser(user, amount, null, null, null);
    }

    @Transactional
    @CacheEvict(value = "paymentStats", allEntries = true)
    public void creditToUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType, User counterpartUser) {
        log.info("Crediting {} to user's e-wallet: {}", amount, user.getEmail());

        EWallet eWallet = eWalletRepository.findByUserWithLock(user)
                .orElseGet(() -> {
                    log.info("Creating new e-wallet for user: {}", user.getEmail());
                    EWallet newWallet = eWalletMapper.createDefaultEWallet(user, appConfigProperties.getEWallet().getDefaultBalance());
                    return eWalletRepository.save(newWallet);
                });

        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);

        if (transactionType == PaymentTransactionType.REFUND) {
            // Refund: counterpartUser = seller (from), user = buyer (to)
            User fromUser = counterpartUser != null ? counterpartUser : user;
            Payment payment = buildRefundPayment(fromUser, user, amount, listingId);
            paymentRepository.save(payment);
            eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
            log.info("Refund payment record created for user: {} amount: {}", user.getEmail(), amount);
        } else if (transactionType == PaymentTransactionType.ITEM_SALE) {
            // Item sale: counterpartUser = buyer (from), user = seller (to)
            User fromUser = counterpartUser != null ? counterpartUser : user;
            Payment payment = buildItemSalePayment(fromUser, user, amount, listingId);
            paymentRepository.save(payment);
            eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
            log.info("Item sale payment record created for seller: {} amount: {}", user.getEmail(), amount);
        }

        log.info("Successfully credited {} to user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }

    @Transactional
    public void creditWalletQuietly(User user, BigDecimal amount) {
        log.info("Quietly crediting {} to user's e-wallet (Escrow Release): {}", amount, user.getEmail());

        EWallet eWallet = eWalletRepository.findByUserWithLock(user)
                .orElseGet(() -> {
                    EWallet newWallet = eWalletMapper.createDefaultEWallet(user, appConfigProperties.getEWallet().getDefaultBalance());
                    return eWalletRepository.save(newWallet);
                });

        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);
    }

    @Transactional
    @CacheEvict(value = "paymentStats", allEntries = true)
    public void debitFromUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType, User counterpartUser) {
        log.info("Debiting {} from user's e-wallet: {}", amount, user.getEmail());

        EWallet eWallet = getEWalletOrThrowWithLock(user);
        ensureValid(eWalletValidator.validateSufficientBalance(eWallet, amount));

        eWallet.setBalance(EWalletBalanceUtil.subtract(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);

        if (transactionType == PaymentTransactionType.REFUND) {
            // Refund debit: user = seller (from), counterpartUser = buyer (to)
            Payment payment = buildRefundDebitPayment(user, counterpartUser, amount, listingId);
            paymentRepository.save(payment);
            eventPublisher.publishEvent(new com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent(this, payment));
            log.info("Refund debit payment record created for seller: {} amount: {}", user.getEmail(), amount);
        }

        log.info("Successfully debited {} from user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }

    // --- Payment record builders (moved from EWalletMapper) ---

    private Payment buildDepositPayment(User user, BigDecimal amount) {
        return Payment.builder()
                .fromUser(user) // User deposits from bank (fromUser = user to satisfy NOT NULL constraint)
                .toUser(user)   // User receives
                .amount(amount)
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_DEPOSIT)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    private Payment buildWithdrawalPayment(User user, BigDecimal amount) {
        return Payment.builder()
                .fromUser(user)  // User sends from e-wallet
                .toUser(user)    // User receives to bank
                .amount(amount)
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_WITHDRAWAL)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    private Payment buildRefundPayment(User seller, User buyer, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(seller) // Seller/System returns money
                .toUser(buyer)    // Buyer receives refund
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    private Payment buildRefundDebitPayment(User seller, User buyer, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(seller) // Seller returns money
                .toUser(buyer)    // Buyer receives
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.REFUND)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    private Payment buildItemSalePayment(User buyer, User seller, BigDecimal amount, UUID listingId) {
        return Payment.builder()
                .fromUser(buyer)  // Buyer pays
                .toUser(seller)   // Seller receives sale proceeds
                .amount(amount)
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.ITEM_SALE)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(listingId)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();
    }

    // --- Helpers ---

    private EWallet getEWalletOrThrow(User user) {
        return eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    private EWallet getEWalletOrThrowWithLock(User user) {
        return eWalletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    private void ensureValid(Result<Void> result) {
        if (result.isError()) {
            throw new BusinessException(result.getMessage(), HttpStatus.BAD_REQUEST, result.getErrorCode());
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getAuthenticatedUser(authentication);
    }
}
