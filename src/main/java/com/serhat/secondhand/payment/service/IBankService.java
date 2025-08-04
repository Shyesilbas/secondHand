package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.dto.BankRequest;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.user.domain.entity.User;

public interface IBankService {
    BankDto getBankInfo(User user);
    Bank createBank(BankRequest bankRequest);
}
