package com.serhat.secondhand.ewallet.service;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.mapper.EWalletMapper;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.ewallet.util.EWalletBalanceUtil;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.user.application.UserService;
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
public class EWalletService {

    private final EWalletRepository eWalletRepository;
    private final BankService bankService;
    private final PaymentRepository paymentRepository;
    private final EWalletMapper eWalletMapper;
    private final EWalletValidator eWalletValidator;
    private final UserService userService;

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
        EWallet eWallet = getEWalletOrThrow(user);

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
        EWallet eWallet = getEWalletOrThrow(user);

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
        EWallet eWallet = getEWalletOrThrow(user);
        return eWallet.getBalance().compareTo(amount) >= 0;
    }

    @Transactional(readOnly = true)
    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        if (user == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        EWallet eWallet = getEWalletOrThrow(user);
        return eWallet.getBalance().compareTo(amount) >= 0;
    }

    @Transactional
    public void processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        log.info("Starting eWallet payment processing: {} -> {} amount: {} for listing: {}",
                fromUser != null ? fromUser.getEmail() : "SYSTEM",
                toUser != null ? toUser.getEmail() : "SYSTEM",
                amount != null ? amount : BigDecimal.ZERO,
                listingId != null ? listingId : "N/A");

        EWallet fromWallet = getEWalletOrThrow(fromUser);
        log.info("Found payer wallet with balance: {}", fromWallet.getBalance());

        eWalletValidator.validateSufficientBalance(fromWallet, amount);

        fromWallet.setBalance(EWalletBalanceUtil.subtract(fromWallet.getBalance(), amount));
        eWalletRepository.save(fromWallet);

        log.info("Deducted {} from payer wallet. New balance: {}", amount, fromWallet.getBalance());
        log.info("eWallet payment completed successfully: {} -> {} amount: {}",
                fromUser != null ? fromUser.getEmail() : "SYSTEM",
                toUser != null ? toUser.getEmail() : "SYSTEM",
                amount != null ? amount : BigDecimal.ZERO);
    }

    @Transactional
    public void creditToUser(User user, BigDecimal amount) {
        log.info("Crediting {} to user's e-wallet: {}", amount, user.getEmail());

        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Creating new e-wallet for user: {}", user.getEmail());
                    EWallet newWallet = eWalletMapper.createDefaultEWallet(user, new BigDecimal("10000.00"));
                    return eWalletRepository.save(newWallet);
                });

        eWallet.setBalance(EWalletBalanceUtil.add(eWallet.getBalance(), amount));
        eWalletRepository.save(eWallet);

        log.info("Successfully credited {} to user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }

    private EWallet getEWalletOrThrow(User user) {
        return eWalletRepository.findByUser(user)
                .orElseThrow(() -> new com.serhat.secondhand.core.exception.BusinessException(
                        com.serhat.secondhand.payment.util.PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getAuthenticatedUser(authentication);
    }

}
