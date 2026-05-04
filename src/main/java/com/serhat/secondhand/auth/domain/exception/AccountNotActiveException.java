package com.serhat.secondhand.auth.domain.exception;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AccountNotActiveException extends BusinessException {

    private final AccountStatus accountStatus;

    public AccountNotActiveException(String message, AccountStatus status) {
        super(message, HttpStatus.FORBIDDEN, "ACCOUNT_NOT_ACTIVE");
        this.accountStatus = status;
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
