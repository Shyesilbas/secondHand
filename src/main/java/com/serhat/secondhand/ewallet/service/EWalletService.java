package com.serhat.secondhand.ewallet.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.payment.entity.*;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EWalletService {

    private final EWalletRepository eWalletRepository;
    private final BankService bankService;
    private final PaymentRepository paymentRepository;

    public EWalletDto createEWallet(EwalletRequest ewalletRequest) {
        User user = getCurrentUser();

        if (eWalletRepository.existsByUser(user)) {
            throw new BusinessException(PaymentErrorCodes.EWALLET_EXISTS);
        }

        EWallet eWallet = EWallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .walletLimit(ewalletRequest.limit())
                .spendingWarningLimit(ewalletRequest.spendingWarningLimit())
                .build();

        eWallet = eWalletRepository.save(eWallet);
        log.info("eWallet created for user: {} with ID: {}", user.getEmail(), eWallet.getId());

        return mapToDto(eWallet);
    }

    public EWalletDto getEWalletByUserId() {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);
        return mapToDto(eWallet);
    }

    public void updateSpendingWarningLimit(BigDecimal spendingWarningLimit) {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);

        if (spendingWarningLimit.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }

        eWallet.setSpendingWarningLimit(spendingWarningLimit.setScale(2, RoundingMode.HALF_UP));
        eWalletRepository.save(eWallet);

        log.info("eWallet spending warning limit updated for user: {} new limit: {}", user.getEmail(), spendingWarningLimit);
    }

    public void removeSpendingWarningLimit() {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);
        eWallet.setSpendingWarningLimit(null);
        eWalletRepository.save(eWallet);
        log.info("eWallet spending warning limit removed for user: {}", user.getEmail());
    }

    @Transactional
    public void deposit(DepositRequest request) {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        Bank bank = bankService.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));

        if (!bank.getId().equals(request.getBankId())) {
            throw new BusinessException(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }

        BigDecimal walletLimit = eWallet.getWalletLimit();
        BigDecimal balanceAfterUpdate = eWallet.getBalance().add(request.getAmount());

        if(balanceAfterUpdate.compareTo(walletLimit)>0){
            throw new BusinessException(PaymentErrorCodes.WALLET_LIMIT_EXCEEDED);
        }

        bankService.debit(user, request.getAmount());

        eWallet.setBalance(eWallet.getBalance().add(request.getAmount()).setScale(2, RoundingMode.HALF_UP));
        eWalletRepository.save(eWallet);

        Payment payment = Payment.builder()
                .fromUser(user)
                .toUser(null)
                .amount(request.getAmount())
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_DEPOSIT)
                .paymentDirection(PaymentDirection.INCOMING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();

        paymentRepository.save(payment);
        log.info("eWallet deposit successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    public void withdraw(WithdrawRequest request) {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        if (eWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }

        Bank bank = bankService.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));

        if (!bank.getId().equals(request.getBankId())) {
            throw new BusinessException(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }

        eWallet.setBalance(eWallet.getBalance().subtract(request.getAmount()).setScale(2, RoundingMode.HALF_UP));
        eWalletRepository.save(eWallet);

        bankService.credit(user, request.getAmount());

        Payment payment = Payment.builder()
                .fromUser(user)
                .toUser(null)
                .amount(request.getAmount())
                .paymentType(PaymentType.TRANSFER)
                .transactionType(PaymentTransactionType.EWALLET_WITHDRAWAL)
                .paymentDirection(PaymentDirection.OUTGOING)
                .listingId(null)
                .processedAt(LocalDateTime.now())
                .isSuccess(true)
                .build();

        paymentRepository.save(payment);
        log.info("eWallet withdrawal successful for user: {} amount: {}", user.getEmail(), request.getAmount());
    }

    @Transactional
    public EWalletDto updateLimits( UpdateLimitRequest request) {
        User user = getCurrentUser();
        EWallet eWallet = getEWalletOrThrow(user);

        if (request.getNewLimit().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }

        eWallet.setWalletLimit(request.getNewLimit().setScale(2, RoundingMode.HALF_UP));
        eWallet = eWalletRepository.save(eWallet);

        log.info("eWallet limit updated for user: {} new limit: {}", user.getEmail(), request.getNewLimit());
        return mapToDto(eWallet);
    }

    public boolean hasSufficientBalance(BigDecimal amount) {
        User user = getCurrentUser();
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

        if (fromWallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }

        fromWallet.setBalance(fromWallet.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP));
        eWalletRepository.save(fromWallet);
        log.info("Deducted {} from payer wallet. New balance: {}", amount, fromWallet.getBalance());

        log.info("eWallet payment completed successfully: {} -> {} amount: {}",
                fromUser != null ? fromUser.getEmail() : "SYSTEM",
                toUser != null ? toUser.getEmail() : "SYSTEM",
                amount != null ? amount : BigDecimal.ZERO);
    }

    private EWalletDto mapToDto(EWallet eWallet) {
        return new EWalletDto(eWallet.getUser().getId(), eWallet.getBalance(), eWallet.getWalletLimit(), eWallet.getSpendingWarningLimit());
    }

    private EWallet getEWalletOrThrow(User user) {
        return eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));
    }

    @Transactional
    public void creditToUser(User user, BigDecimal amount) {
        log.info("Crediting {} to user's e-wallet: {}", amount, user.getEmail());
        
        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Creating new e-wallet for user: {}", user.getEmail());
                    EWallet newWallet = EWallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                            .walletLimit(new BigDecimal("10000.00").setScale(2, RoundingMode.HALF_UP))
                            .build();
                    return eWalletRepository.save(newWallet);
                });
        
        eWallet.setBalance(eWallet.getBalance().add(amount).setScale(2, RoundingMode.HALF_UP));
        eWalletRepository.save(eWallet);
        log.info("Successfully credited {} to user's e-wallet. New balance: {}", amount, eWallet.getBalance());
    }


    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

}
