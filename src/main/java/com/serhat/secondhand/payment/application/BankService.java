package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.bank.BankValidator;
import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.BankMapper;
import com.serhat.secondhand.payment.repository.BankRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BankService {

    private final BankRepository bankRepository;
    private final IUserService userService;
    private final BankMapper bankMapper;
    private final BankValidator bankValidator;


    public BankDto getBankInfo(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);
        return bankMapper.toDto(bank);
    }

    public BankDto createBankAccount(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        ensureValid(bankValidator.validateForCreate(user));

        Bank bank = bankMapper.fromCreateRequest(user);
        bank = bankRepository.save(bank);
        log.info("Bank account created for user: {} with ID: {}", user.getEmail(), bank.getId());

        return bankMapper.toDto(bank);
    }

    public Map<String, Object> checkBankAccountExists(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        java.util.Optional<Bank> bankOpt = findByUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("hasBankAccount", bankOpt.isPresent());
        response.put("iban", bankOpt.map(Bank::getIBAN).orElse(null));
        return response;
    }

    public Map<String, Object> getBankBalance(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);
        return Map.of(
                "balance", bank.getBalance(),
                "iban", bank.getIBAN(),
                "currency", PaymentProcessingConstants.DEFAULT_CURRENCY
        );
    }

    public void deleteBankAccount(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);
        ensureValid(bankValidator.validateAccountNotEmpty(bank));

        bankRepository.delete(bank);
        log.info("Bank account deleted for user: {}", user.getEmail());
    }


    public java.util.Optional<Bank> findByUser(User user) {
        return bankRepository.findByAccountHolder(user);
    }

    public Bank findByUserMandatory(User user) {
        return findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));
    }

    public Bank findByUserMandatoryWithLock(User user) {
        return bankRepository.findByAccountHolderWithLock(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND));
    }

    public void credit(User user, BigDecimal amount) {
        ensureValid(bankValidator.validateCreditAmount(amount));
        Bank bank = findByUserMandatoryWithLock(user);
        bank.setBalance(bank.getBalance().add(amount));
        bankRepository.save(bank);
        log.info("Credited {} to user {}. New balance: {}", amount, user.getEmail(), bank.getBalance());
    }

    public void debit(User user, BigDecimal amount) {
        ensureValid(bankValidator.validateDebitAmount(amount));
        Bank bank = findByUserMandatoryWithLock(user);
        ensureValid(bankValidator.validateSufficientBalance(bank, amount));
        bank.setBalance(bank.getBalance().subtract(amount));
        bankRepository.save(bank);
        log.info("Debited {} from user {}. New balance: {}", amount, user.getEmail(), bank.getBalance());
    }

    @Transactional(readOnly = true)
    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        return bankValidator.hasSufficientBalance(user, amount);
    }

    @Transactional
    public PaymentResult processBankPayment(User fromUser, User toUser, BigDecimal amount, java.util.UUID listingId) {
        if (fromUser == null) {
            return PaymentResult.failure("User not found", amount, PaymentType.TRANSFER, listingId, null, toUser != null ? toUser.getId() : null);
        }

        try {
            debit(fromUser, amount);
            log.info("Bank transfer processed successfully for user: {}, amount: {}", fromUser.getEmail(), amount);
            return PaymentResult.success(
                    java.util.UUID.randomUUID().toString(),
                    amount,
                    PaymentType.TRANSFER,
                    listingId,
                    fromUser.getId(),
                    toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            log.error("Error processing bank transfer for user: {}", fromUser.getEmail(), e);
            return PaymentResult.failure(
                    e.getMessage(),
                    amount,
                    PaymentType.TRANSFER,
                    listingId,
                    fromUser.getId(),
                    toUser != null ? toUser.getId() : null);
        }
    }

    private void ensureValid(com.serhat.secondhand.core.result.Result<Void> validationResult) {
        if (validationResult.isError()) {
            throw new BusinessException(
                    validationResult.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    validationResult.getErrorCode()
            );
        }
    }

}
