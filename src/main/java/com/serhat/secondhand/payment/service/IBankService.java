package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.dto.BankRequest;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.security.core.Authentication;

import java.util.Map;

public interface IBankService {
    BankDto getBankInfo(User user);
    Bank createBank(BankRequest bankRequest);
    Bank createBankAccount(User user);
    boolean hasUserBankAccount(User user);
    Bank findByUser(User user);
    
    // Controller-specific methods with Authentication
    BankDto getBankAccountInfo(Authentication authentication);
    BankDto createBankAccount(BankRequest bankRequest, Authentication authentication);
    Map<String, Object> checkBankAccountExists(Authentication authentication);
    Map<String, Object> getBankBalance(Authentication authentication);
    Map<String, String> getBankIban(Authentication authentication);
}
