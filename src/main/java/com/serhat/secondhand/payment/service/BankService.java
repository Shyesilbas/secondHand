package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.mapper.BankMapper;
import com.serhat.secondhand.payment.helper.IbanGenerator;
import com.serhat.secondhand.payment.repo.BankRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BankService {

    private final BankRepository bankRepository;
    private final UserService userService;
    private final BankMapper bankMapper;

    public BankDto getBankInfo(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);

        return bankMapper.toDto(bank);
    }

    public BankDto createBankAccount(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);

        if (bankRepository.existsByAccountHolder(user)) {
            throw new BusinessException("User already has a bank account", HttpStatus.CONFLICT, "BANK_ACCOUNT_EXISTS");
        }

        Bank bank = Bank.builder()
                .accountHolder(user)
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .IBAN(IbanGenerator.generateIban())
                .build();

        bank = bankRepository.save(bank);
        log.info("Bank account created for user: {} with ID: {}", user.getEmail(), bank.getId());

        return bankMapper.toDto(bank);
    }

    public Optional<Bank> findByUser(User user) {
        return bankRepository.findByAccountHolder(user);
    }
    
    public Bank findByUserMandatory(User user) {
        return findByUser(user)
            .orElseThrow(() -> new BusinessException("User does not have a bank account", HttpStatus.NOT_FOUND, "BANK_ACCOUNT_NOT_FOUND"));
    }

    public void credit(User user, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Credit amount must be positive. User: {}, Amount: {}", user.getEmail(), amount);
            return;
        }
        Bank bank = findByUserMandatory(user);
        bank.setBalance(bank.getBalance().add(amount));
        bankRepository.save(bank);
        log.info("Credited {} to user {}. New balance: {}", amount, user.getEmail(), bank.getBalance());
    }

    public void debit(User user, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Debit amount must be positive.", HttpStatus.BAD_REQUEST, "INVALID_DEBIT_AMOUNT");
        }
        Bank bank = findByUserMandatory(user);
        if (bank.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient funds.", HttpStatus.BAD_REQUEST, "INSUFFICIENT_FUNDS");
        }
        bank.setBalance(bank.getBalance().subtract(amount));
        bankRepository.save(bank);
        log.info("Debited {} from user {}. New balance: {}", amount, user.getEmail(), bank.getBalance());
    }

    public Map<String, Object> checkBankAccountExists(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Optional<Bank> bankOpt = findByUser(user);
        return Map.of(
                "hasBankAccount", bankOpt.isPresent(),
                "iban", bankOpt.map(Bank::getIBAN).orElse(null)
        );
    }

    public Map<String, Object> getBankBalance(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);
        return Map.of(
                "balance", bank.getBalance(),
                "iban", bank.getIBAN(),
                "currency", "TRY"
        );
    }

    public void deleteBankAccount(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Bank bank = findByUserMandatory(user);
        bankRepository.delete(bank);
        log.info("Bank account deleted for user: {}", user.getEmail());
    }
}
