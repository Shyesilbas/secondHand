package com.serhat.secondhand.ewallet.mapper;

import com.serhat.secondhand.ewallet.dto.EWalletDto;
import com.serhat.secondhand.ewallet.dto.EwalletRequest;
import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.ewallet.util.EWalletBalanceUtil;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EWalletMapper {

    public EWalletDto toDto(EWallet eWallet) {
        return new EWalletDto(
                eWallet.getUser().getId(),
                eWallet.getBalance(),
                eWallet.getWalletLimit(),
                eWallet.getSpendingWarningLimit()
        );
    }

    public EWallet fromCreateRequest(EwalletRequest request, User user) {
        return EWallet.builder()
                .user(user)
                .balance(EWalletBalanceUtil.zero())
                .walletLimit(request.limit())
                .spendingWarningLimit(request.spendingWarningLimit())
                .build();
    }

    public EWallet createDefaultEWallet(User user, BigDecimal defaultLimit) {
        return EWallet.builder()
                .user(user)
                .balance(EWalletBalanceUtil.zero())
                .walletLimit(defaultLimit != null ? EWalletBalanceUtil.scale(defaultLimit) : new BigDecimal("10000.00"))
                .build();
    }
}

