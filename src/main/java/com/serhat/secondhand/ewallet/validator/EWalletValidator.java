package com.serhat.secondhand.ewallet.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EWalletValidator {

    private final EWalletRepository eWalletRepository;

    public Result<Void> validateEWalletNotExists(User user) {
        if (eWalletRepository.existsByUser(user)) {
            return Result.error(PaymentErrorCodes.EWALLET_EXISTS);
        }
        return Result.success();
    }

    public Result<Void> validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_AMOUNT);
        }
        return Result.success();
    }

    public Result<Void> validateWalletLimit(BigDecimal limit) {
        if (limit != null && limit.compareTo(BigDecimal.ZERO) < 0) {
            return Result.error(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }
        return Result.success();
    }

    public Result<Void> validateSpendingWarningLimit(BigDecimal limit) {
        if (limit != null && limit.compareTo(BigDecimal.ZERO) < 0) {
            return Result.error(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }
        return Result.success();
    }

    public Result<Void> validateBankAccount(Bank bank, UUID requestBankId) {
        if (bank == null) {
            return Result.error(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND);
        }
        if (!bank.getId().equals(requestBankId)) {
            return Result.error(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }
        return Result.success();
    }

    public Result<Void> validateDeposit(EWallet eWallet, BigDecimal amount) {
        Result<Void> amountResult = validateAmount(amount);
        if (amountResult.isError()) {
            return amountResult;
        }
        BigDecimal walletLimit = eWallet.getWalletLimit();
        if (walletLimit != null) {
            BigDecimal balanceAfterUpdate = eWallet.getBalance().add(amount);
            if (balanceAfterUpdate.compareTo(walletLimit) > 0) {
                return Result.error(PaymentErrorCodes.WALLET_LIMIT_EXCEEDED);
            }
        }
        return Result.success();
    }

    public Result<Void> validateWithdraw(EWallet eWallet, BigDecimal amount) {
        Result<Void> amountResult = validateAmount(amount);
        if (amountResult.isError()) {
            return amountResult;
        }
        if (eWallet.getBalance().compareTo(amount) < 0) {
            return Result.error(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }
        return Result.success();
    }

    public Result<Void> validateSufficientBalance(EWallet eWallet, BigDecimal amount) {
        if (eWallet.getBalance().compareTo(amount) < 0) {
            return Result.error(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }
        return Result.success();
    }

    public boolean hasSufficientBalance(User user, BigDecimal amount) {
        if (user == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        Optional<EWallet> eWallet = eWalletRepository.findByUser(user);
        if (eWallet.isEmpty()) {
            return false;
        }
        return eWallet.get().getBalance().compareTo(amount) >= 0;
    }
}

