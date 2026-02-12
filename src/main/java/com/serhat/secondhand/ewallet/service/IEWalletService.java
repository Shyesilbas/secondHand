package com.serhat.secondhand.ewallet.service;

import com.serhat.secondhand.ewallet.dto.*;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;

import java.math.BigDecimal;
import java.util.UUID;

public interface IEWalletService {
    
    EWalletDto createEWallet(EwalletRequest ewalletRequest);
    
    EWalletDto getEWalletByUserId();
    
    void updateSpendingWarningLimit(BigDecimal spendingWarningLimit);
    
    void removeSpendingWarningLimit();
    
    void deposit(DepositRequest request);
    
    void withdraw(WithdrawRequest request);
    
    EWalletDto updateLimits(UpdateLimitRequest request);
    
    boolean hasSufficientBalance(BigDecimal amount);
    
    boolean hasSufficientBalance(User user, BigDecimal amount);
    
    PaymentResult processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId);
    
    void creditToUser(User user, BigDecimal amount);
    
    void creditToUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType);
    
    void debitFromUser(User user, BigDecimal amount, UUID listingId, PaymentTransactionType transactionType);
}
