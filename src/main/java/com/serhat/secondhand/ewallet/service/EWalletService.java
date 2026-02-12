package com.serhat.secondhand.ewallet.service;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.mapper.EWalletMapper;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.util.EWalletBalanceUtil;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Transactional
    public EWalletDto createEWallet(EwalletRequest ewalletRequest) {
        User user = getAuthenticatedUser();
        log.info("Creating eWallet for user: {}", user.getEmail());

        eWalletValidator.validateEWalletNotExists(user);
        eWalletValidator.validateWalletLimit(ewalletRequest.limit());
        eWalletValidator.validateSpendingWarningLimit(ewalletRequest.spendingWarningLimit());

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

        eWalletValidator.validateSpendingWarningLimit(spendingWarningLimit);

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
    public void deposit(DepositRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrowWithLock(user);

        eWalletValidator.validateDeposit(eWallet, request.getAmount());

        Bank bank = bankService.findByUser(user).orElse(null);
        eWalletValidator.validateBankAccount(bank, request.getBankId());

        bankService.debit(user, request.getAmount());

        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), request.getAmount()));
        eWalletRepository.save(eWallet);

        var payment = eWalletMapper.buildDepositPayment(user, request.getAmount());
        paymentRepository.save(payment);

        log.info("eWallet deposit successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    public void withdraw(WithdrawRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrowWithLock(user);

        eWalletValidator.validateWithdraw(eWallet, request.getAmount());

        Bank bank = bankService.findByUser(user).orElse(null);
        eWalletValidator.validateBankAccount(bank, request.getBankId());

        eWallet.setBalance(EWalletBalanceUtil.subtract(eWallet.getBalance(), request.getAmount()));
        eWalletRepository.save(eWallet);

        bankService.credit(user, request.getAmount());

        var payment = eWalletMapper.buildWithdrawalPayment(user, request.getAmount());
        paymentRepository.save(payment);

        log.info("eWallet withdrawal successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    public EWalletDto updateLimits(UpdateLimitRequest request) {
        User user = getAuthenticatedUser();
        EWallet eWallet = getEWalletOrThrow(user);

        eWalletValidator.validateWalletLimit(request.getNewLimit());

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
    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        return eWalletValidator.hasSufficientBalance(user, amount);
    }

    @Transactional
    public PaymentResult processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        if (fromUser == null) {
            return PaymentResult.failure("User not found", amount, PaymentType.EWALLET, listingId, null, toUser != null ? toUser.getId() : null);
        }

        try {
        log.info("Starting eWallet payment processing: {} -> {} amount: {} for listing: {}",
                    fromUser.getEmail(),
                toUser != null ? toUser.getEmail() : "SYSTEM",
                    amount,
                    listingId);

        EWallet fromWallet = getEWalletOrThrowWithLock(fromUser);
        log.info("Found payer wallet with balance: {}", fromWallet.getBalance());

            eWalletValidator.validateSufficientBalance(fromWallet, amount);

            fromWallet.setBalance(EWalletBalanceUtil.subtract(fromWallet.getBalance(), amount));
        eWalletRepository.save(fromWallet);

        log.info("Deducted {} from payer wallet. New balance: {}", amount, fromWallet.getBalance());
        log.info("eWallet payment completed successfully: {} -> {} amount: {}",
                    fromUser.getEmail(),
                toUser != null ? toUser.getEmail() : "SYSTEM",
                    amount);

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
        creditToUser(user, amount, null, null);
    }

    @Transactional
    public void creditToUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType) {
        log.info("Crediting {} to user's e-wallet: {}", amount, user.getEmail());
        
        EWallet eWallet = eWalletRepository.findByUserWithLock(user)
                .orElseGet(() -> {
                    log.info("Creating new e-wallet for user: {}", user.getEmail());
                    EWallet newWallet = eWalletMapper.createDefaultEWallet(user, new BigDecimal("10000.00"));
                    return eWalletRepository.save(newWallet);
                });
        
        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);

        if (transactionType == PaymentTransactionType.REFUND) {
            var payment = eWalletMapper.buildRefundPayment(user, amount, listingId);
            paymentRepository.save(payment);
            log.info("Refund payment record created for user: {} amount: {}", user.getEmail(), amount);
        } else if (transactionType == PaymentTransactionType.ITEM_SALE) {
            var payment = eWalletMapper.buildItemSalePayment(user, amount, listingId);
            paymentRepository.save(payment);
            log.info("Item sale payment record created for seller: {} amount: {}", user.getEmail(), amount);
        }

        log.info("Successfully credited {} to user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }

    @Transactional
    public void debitFromUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType) {
        log.info("Debiting {} from user's e-wallet: {}", amount, user.getEmail());
        
        EWallet eWallet = getEWalletOrThrowWithLock(user);
        
        eWalletValidator.validateSufficientBalance(eWallet, amount);
        
        eWallet.setBalance(EWalletBalanceUtil.subtract(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);

        if (transactionType == PaymentTransactionType.REFUND) {
            var payment = eWalletMapper.buildRefundDebitPayment(user, amount, listingId);
            paymentRepository.save(payment);
            log.info("Refund debit payment record created for seller: {} amount: {}", user.getEmail(), amount);
        }

        log.info("Successfully debited {} from user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }

    private EWallet getEWalletOrThrow(User user) {
        return eWalletRepository.findByUser(user)
                .orElseThrow(() -> new com.serhat.secondhand.core.exception.BusinessException(
                        com.serhat.secondhand.payment.util.PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    private EWallet getEWalletOrThrowWithLock(User user) {
        return eWalletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new com.serhat.secondhand.core.exception.BusinessException(
                        com.serhat.secondhand.payment.util.PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getAuthenticatedUser(authentication);
    }

}
