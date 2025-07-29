package com.serhat.secondhand.exception.auth;

import com.serhat.secondhand.entity.enums.AccountStatus;
import lombok.Getter;

@Getter
public class AccountNotActiveException extends RuntimeException {
    private final AccountStatus accountStatus;

    public AccountNotActiveException(String message, AccountStatus accountStatus) {
        super(message);
        this.accountStatus = accountStatus;
    }

    public static AccountNotActiveException withStatus(AccountStatus status) {
        String message = switch (status) {
            case BLOCKED -> "Your account has been blocked. Please contact support for assistance.";
            case CLOSED -> "Your account has been closed. Please contact support to reactivate your account.";
            default -> "Your account is not active. Please contact support.";
        };
        return new AccountNotActiveException(message, status);
    }



}
