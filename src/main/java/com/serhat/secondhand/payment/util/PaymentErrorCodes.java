package com.serhat.secondhand.payment.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum PaymentErrorCodes implements ErrorCode {
    NULL_RECIPIENT("NULL_RECIPIENT", "Recipient user must not be null for this transaction type", HttpStatus.BAD_REQUEST),
    INVALID_AMOUNT("INVALID_AMOUNT", "Payment amount must be greater than zero", HttpStatus.BAD_REQUEST),
    SELF_PAYMENT("SELF_PAYMENT", "Cannot make payment to yourself", HttpStatus.BAD_REQUEST),
    PAYMENT_TYPE_REQUIRED("PAYMENT_TYPE_REQUIRED", "Payment type is required", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_PAYMENT_TYPE("UNSUPPORTED_PAYMENT_TYPE", "Unsupported payment type", HttpStatus.BAD_REQUEST),
    LISTING_NOT_FOUND("LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    PAYMENT_VERIFICATION_REQUIRED("PAYMENT_VERIFICATION_REQUIRED", "Verification code required. Code sent via email", HttpStatus.PRECONDITION_REQUIRED),
    INVALID_VERIFICATION_CODE("INVALID_VERIFICATION_CODE", "Invalid or expired verification code", HttpStatus.BAD_REQUEST),
    EMPTY_PAYMENT_BATCH("EMPTY_PAYMENT_BATCH", "No payments to process", HttpStatus.BAD_REQUEST),
    INVALID_TXN_TYPE("INVALID_TXN_TYPE", "Invalid transaction type in batch", HttpStatus.BAD_REQUEST),
    INVALID_DIRECTION("INVALID_DIRECTION", "Invalid payment direction in batch", HttpStatus.BAD_REQUEST),
    CREDIT_CARD_NOT_FOUND("CREDIT_CARD_NOT_FOUND", "User does not have a credit card", HttpStatus.NOT_FOUND),
    CREDIT_CARD_EXISTS("CREDIT_CARD_EXISTS", "User already has a credit card", HttpStatus.CONFLICT),
    INVALID_CREDIT_LIMIT("INVALID_CREDIT_LIMIT", "Credit limit must be greater than zero", HttpStatus.BAD_REQUEST),
    BANK_ACCOUNT_EXISTS("BANK_ACCOUNT_EXISTS", "User already has a bank account", HttpStatus.CONFLICT),
    BANK_ACCOUNT_NOT_FOUND("BANK_ACCOUNT_NOT_FOUND", "User does not have a bank account", HttpStatus.NOT_FOUND),
    INVALID_DEBIT_AMOUNT("INVALID_DEBIT_AMOUNT", "Debit amount must be positive", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_FUNDS("INSUFFICIENT_FUNDS", "Insufficient funds", HttpStatus.BAD_REQUEST),
    EWALLET_EXISTS("EWALLET_EXISTS", "User already has an eWallet", HttpStatus.CONFLICT),
    EWALLET_NOT_FOUND("EWALLET_NOT_FOUND", "eWallet not found for user", HttpStatus.NOT_FOUND),
    INVALID_BANK_ACCOUNT("INVALID_BANK_ACCOUNT", "Invalid bank account selected", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_EWALLET_BALANCE("INSUFFICIENT_EWALLET_BALANCE", "Insufficient balance in eWallet", HttpStatus.BAD_REQUEST),
    INVALID_WALLET_LIMIT("INVALID_WALLET_LIMIT", "Wallet limit cannot be negative", HttpStatus.BAD_REQUEST),
    BANK_ACCOUNT_NOT_EMPTY("BANK_ACCOUNT_NOT_EMPTY", "Bank account must be empty before deleting." , HttpStatus.BAD_REQUEST ),
    INVALID_CREDIT_AMOUNT("INVALID_CREDIT_AMOUNT", "Credit amount must be greater than zero" , HttpStatus.BAD_REQUEST ),
    WALLET_LIMIT_EXCEEDED("WALLET_LIMIT_EXCEEDED","Your balance will exceed your limit after this operation." , HttpStatus.BAD_REQUEST),
    AGREEMENTS_NOT_ACCEPTED("AGREEMENTS_NOT_ACCEPTED", "Payment agreements must be accepted", HttpStatus.BAD_REQUEST),
    INVALID_AGREEMENT_COUNT("INVALID_AGREEMENT_COUNT", "All required agreements must be accepted", HttpStatus.BAD_REQUEST),
    REQUIRED_AGREEMENTS_NOT_ACCEPTED("REQUIRED_AGREEMENTS_NOT_ACCEPTED", "Required payment agreements are not accepted", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    PaymentErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
