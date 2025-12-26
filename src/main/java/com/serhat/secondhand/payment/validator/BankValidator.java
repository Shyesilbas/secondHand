package com.serhat.secondhand.payment.validator;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.repo.BankRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BankValidator {

    private final BankRepository bankRepository;

    public void validateForCreate(User user) {
        if (bankRepository.existsByAccountHolder(user)) {
            throw new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_EXISTS);
        }
    }


    public void validateSufficientBalance(Bank bank, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        if (bank.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_FUNDS);
        }
    }


    public void validateCreditAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_CREDIT_AMOUNT);
        }
    }

    public void validateDebitAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_DEBIT_AMOUNT);
        }
    }

    public void validateAccountNotEmpty(Bank bank) {
        if (bank.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_EMPTY);
        }
    }

    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        if (user == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        Optional<Bank> bank = bankRepository.findByAccountHolder(user);
        if (bank.isEmpty()) {
            return false;
        }
        return bank.get().getBalance().compareTo(amount) >= 0;
    }
}

