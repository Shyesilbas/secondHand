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
        Bank bank = new Bank();
        bank.setIBAN(IbanGenerator.generateIban());
        bank.setBalance(BigDecimal.ZERO);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(auth.getName());
        bank.setAccountHolder(user);
        bank = bankRepository.save(bank);
        log.info("Bank created: {}", bank.getId());
        return bank;
    }
}
