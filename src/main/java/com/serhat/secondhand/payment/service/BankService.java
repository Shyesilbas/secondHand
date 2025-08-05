package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.dto.BankRequest;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.helper.IbanGenerator;
import com.serhat.secondhand.payment.repo.BankRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankService implements IBankService {
    private final BankRepository bankRepository;
    private final IUserService userService;


    @Override
    public BankDto getBankInfo(User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        user = userService.findByEmail(auth.getName());
        Bank bank = bankRepository.findByAccountHolder(user);

        if(bank == null) {
            throw new BusinessException("Bank not found", HttpStatus.BAD_REQUEST,HttpStatus.BAD_REQUEST.toString());
        }

        return new BankDto(
                bank.getIBAN(),
                bank.getBalance(),
                bank.getAccountHolder().getName(),
                bank.getAccountHolder().getSurname()
        );
    }

    @Override
    public Bank createBank(BankRequest bankRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(auth.getName());
        
        // Check if user already has a bank account
        if (hasUserBankAccount(user)) {
            throw new BusinessException("User already has a bank account", 
                                      HttpStatus.CONFLICT, HttpStatus.CONFLICT.toString());
        }
        
        Bank bank = Bank.builder()
                .accountHolder(user)
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .IBAN(IbanGenerator.generateIban())
                .build();
                
        bank = bankRepository.save(bank);
        log.info("Bank created: {}", bank.getId());
        return bank;
    }

    @Override
    public Bank createBankAccount(User user) {
        // Check if user already has a bank account
        if (hasUserBankAccount(user)) {
            throw new BusinessException("User already has a bank account", 
                                      HttpStatus.CONFLICT, HttpStatus.CONFLICT.toString());
        }

        Bank bank = Bank.builder()
                .accountHolder(user)
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .IBAN(IbanGenerator.generateIban())
                .build();

        Bank savedBank = bankRepository.save(bank);
        log.info("Bank account created for user: {} with IBAN: {}", user.getEmail(), savedBank.getIBAN());
        return savedBank;
    }

    @Override
    public boolean hasUserBankAccount(User user) {
        Bank bank = bankRepository.findByAccountHolder(user);
        return bank != null;
    }

    @Override
    public Bank findByUser(User user) {
        Bank bank = bankRepository.findByAccountHolder(user);
        if (bank == null) {
            throw new BusinessException("User does not have a bank account", 
                                      HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.toString());
        }
        return bank;
    }

    // Controller-specific methods with Authentication
    
    @Override
    public BankDto getBankAccountInfo(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return getBankInfo(user);
    }

    @Override
    public BankDto createBankAccount(BankRequest bankRequest, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Bank createdBank = createBank(bankRequest);
        return getBankInfo(user);
    }

    @Override
    public Map<String, Object> checkBankAccountExists(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        boolean exists = hasUserBankAccount(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasBankAccount", exists);
        response.put("userEmail", user.getEmail());
        
        if (exists) {
            Bank bank = findByUser(user);
            response.put("iban", bank.getIBAN());
            response.put("createdAt", bank.getCreatedAt());
        }
        
        return response;
    }

    @Override
    public Map<String, Object> getBankBalance(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Bank bank = findByUser(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("balance", bank.getBalance());
        response.put("iban", bank.getIBAN());
        response.put("currency", "TRY");
        
        return response;
    }

    @Override
    public Map<String, String> getBankIban(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Bank bank = findByUser(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("iban", bank.getIBAN());
        response.put("accountHolder", user.getName() + " " + user.getSurname());
        
        return response;
    }
}
