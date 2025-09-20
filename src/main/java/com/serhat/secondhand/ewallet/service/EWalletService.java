package com.serhat.secondhand.ewallet.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.ewallet.dto.DepositRequest;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.ewallet.dto.EWalletDto;
import com.serhat.secondhand.ewallet.dto.UpdateLimitRequest;
import com.serhat.secondhand.ewallet.dto.WithdrawRequest;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EWalletService {

    private final EWalletRepository eWalletRepository;
    private final UserService userService;
    private final BankService bankService;
    private final PaymentRepository paymentRepository;


    public EWalletDto createEWallet(Long userId) {
        User user = userService.findById(userId);

        if (eWalletRepository.existsByUser(user)) {
            throw new BusinessException(PaymentErrorCodes.EWALLET_EXISTS);
        }

        EWallet eWallet = EWallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .walletLimit(new BigDecimal("10000.00")) // Default limit
                .build();

        eWallet = eWalletRepository.save(eWallet);
        log.info("eWallet created for user: {} with ID: {}", user.getEmail(), eWallet.getId());

        return mapToDto(eWallet);
    }

    public EWalletDto getEWalletByUserId(Long userId) {
        User user = userService.findById(userId);
        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));

        return mapToDto(eWallet);
    }

    @Transactional
    public void deposit(Long userId, DepositRequest request, Authentication authentication) {
        User user = userService.findById(userId);
        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        // Get specific bank account by ID
        Bank bank = bankService.findByUser(user).orElseThrow(() ->
            new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));

        if (!bank.getId().equals(request.getBankId())) {
            throw new BusinessException(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }

        bankService.debit(user, request.getAmount());

        eWallet.setBalance(eWallet.getBalance().add(request.getAmount()));
        eWalletRepository.save(eWallet);

        // Create payment record for tracking - direct save to avoid circular call
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
    public void withdraw(Long userId, WithdrawRequest request, Authentication authentication) {
        User user = userService.findById(userId);
        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        if (eWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }

        // Get specific bank account by ID
        Bank bank = bankService.findByUser(user).orElseThrow(() ->
            new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));

        if (!bank.getId().equals(request.getBankId())) {
            throw new BusinessException(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }

        eWallet.setBalance(eWallet.getBalance().subtract(request.getAmount()));
        eWalletRepository.save(eWallet);

        bankService.credit(user, request.getAmount());

        // Create payment record for tracking - direct save to avoid circular call
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
    public EWalletDto updateLimits(Long userId, UpdateLimitRequest request) {
        User user = userService.findById(userId);
        EWallet eWallet = eWalletRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));

        if (request.getNewLimit().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }

        eWallet.setWalletLimit(request.getNewLimit());
        eWallet = eWalletRepository.save(eWallet);

        log.info("eWallet limit updated for user: {} new limit: {}", user.getEmail(), request.getNewLimit());
        return mapToDto(eWallet);
    }

    public boolean hasSufficientBalance(Long userId, BigDecimal amount) {
        User user = userService.findById(userId);
        EWallet eWallet = eWalletRepository.findByUser(user).orElse(null);

        if (eWallet == null) {
            return false;
        }

        return eWallet.getBalance().compareTo(amount) >= 0;
    }


    @Transactional
    public void processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        log.info("Starting eWallet payment processing: {} -> {} amount: {} for listing: {}",
                fromUser != null ? fromUser.getEmail() : "SYSTEM",
                toUser != null ? toUser.getEmail() : "SYSTEM",
                amount != null ? amount : BigDecimal.ZERO,
                listingId != null ? listingId : "N/A");

        EWallet fromWallet = eWalletRepository.findByUser(fromUser)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.EWALLET_NOT_FOUND));

        log.info("Found payer wallet with balance: {}", fromWallet.getBalance());

        if (fromWallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }

        fromWallet.setBalance(fromWallet.getBalance().subtract(amount));
        eWalletRepository.save(fromWallet);
        log.info("Deducted {} from payer wallet. New balance: {}", amount, fromWallet.getBalance());

        if (toUser != null) {
            EWallet toWallet = eWalletRepository.findByUser(toUser).orElse(null);
            if (toWallet == null) {
                log.info("Creating new wallet for seller: {}", toUser.getEmail());
                toWallet = EWallet.builder()
                        .user(toUser)
                        .balance(amount)
                        .walletLimit(new BigDecimal("10000.00"))
                        .build();
            } else {
                log.info("Found seller wallet with balance: {}", toWallet.getBalance());
                toWallet.setBalance(toWallet.getBalance().add(amount));
            }
            eWalletRepository.save(toWallet);
            log.info("Credited {} to seller wallet. New balance: {}", amount, toWallet.getBalance());
        } else {
            log.info("No recipient wallet, skipping credit step.");
        }

        log.info("eWallet payment completed successfully: {} -> {} amount: {}",
                fromUser != null ? fromUser.getEmail() : "SYSTEM",
                toUser != null ? toUser.getEmail() : "SYSTEM",
                amount != null ? amount : BigDecimal.ZERO);
    }


    private EWalletDto mapToDto(EWallet eWallet) {
        return new EWalletDto(eWallet.getUser().getId(), eWallet.getBalance(), eWallet.getWalletLimit());
    }

}