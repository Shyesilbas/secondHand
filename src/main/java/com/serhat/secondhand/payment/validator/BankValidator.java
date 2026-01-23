package com.serhat.secondhand.payment.validator;

import com.serhat.secondhand.core.result.Result;
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

    public Result<Void> validateForCreate(User user) {
        if (bankRepository.existsByAccountHolder(user)) {
            return Result.error(PaymentErrorCodes.BANK_ACCOUNT_EXISTS);
        }
        return Result.success();
    }


    public Result<Void> validateSufficientBalance(Bank bank, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_AMOUNT);
        }

        if (bank.getBalance().compareTo(amount) < 0) {
            return Result.error(PaymentErrorCodes.INSUFFICIENT_FUNDS);
        }
        return Result.success();
    }


    public Result<Void> validateCreditAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_CREDIT_AMOUNT);
        }
        return Result.success();
    }

    public Result<Void> validateDebitAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_DEBIT_AMOUNT);
        }
        return Result.success();
    }

    public Result<Void> validateAccountNotEmpty(Bank bank) {
        if (bank.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            return Result.error(PaymentErrorCodes.BANK_ACCOUNT_NOT_EMPTY);
        }
        return Result.success();
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

