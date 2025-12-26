package com.serhat.secondhand.ewallet.validator;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.repository.EWalletRepository;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EWalletValidator {

    private final EWalletRepository eWalletRepository;

    public void validateEWalletNotExists(User user) {
        if (eWalletRepository.existsByUser(user)) {
            throw new BusinessException(PaymentErrorCodes.EWALLET_EXISTS);
        }
    }

    public void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }
    }

    public void validateWalletLimit(BigDecimal limit) {
        if (limit != null && limit.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }
    }

    public void validateSpendingWarningLimit(BigDecimal limit) {
        if (limit != null && limit.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_WALLET_LIMIT);
        }
    }

    public void validateBankAccount(Bank bank, UUID requestBankId) {
        if (bank == null) {
            throw new BusinessException(PaymentErrorCodes.BANK_ACCOUNT_NOT_FOUND);
        }
        if (!bank.getId().equals(requestBankId)) {
            throw new BusinessException(PaymentErrorCodes.INVALID_BANK_ACCOUNT);
        }
    }

    public void validateDeposit(EWallet eWallet, BigDecimal amount) {
        validateAmount(amount);
        BigDecimal walletLimit = eWallet.getWalletLimit();
        if (walletLimit != null) {
            BigDecimal balanceAfterUpdate = eWallet.getBalance().add(amount);
            if (balanceAfterUpdate.compareTo(walletLimit) > 0) {
                throw new BusinessException(PaymentErrorCodes.WALLET_LIMIT_EXCEEDED);
            }
        }
    }

    public void validateWithdraw(EWallet eWallet, BigDecimal amount) {
        validateAmount(amount);
        if (eWallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }
    }

    public void validateSufficientBalance(EWallet eWallet, BigDecimal amount) {
        if (eWallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE);
        }
    }
}

