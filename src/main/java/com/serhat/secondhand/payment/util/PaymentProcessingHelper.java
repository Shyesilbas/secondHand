package com.serhat.secondhand.payment.util;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.payment.service.CreditCardService;
import com.serhat.secondhand.payment.service.BankService;
import com.serhat.secondhand.ewallet.service.EWalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessingHelper {
    private final CreditCardService creditCardService;
    private final BankService bankService;
    private final EWalletService eWalletService;

    public boolean processPayment(PaymentType paymentType, User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        switch (paymentType) {
            case CREDIT_CARD:
                return processCreditCardPayment(fromUser, toUser, amount);
            case TRANSFER:
                return processBankTransfer(fromUser, toUser, amount);
            case EWALLET:
                return processEWalletPayment(fromUser, toUser, amount, listingId);
            default:
                throw new BusinessException("Unsupported payment type", HttpStatus.BAD_REQUEST, "UNSUPPORTED_PAYMENT_TYPE");
        }
    }

    private boolean processCreditCardPayment(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing credit card payment from user: {} to user: {}", fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM");
        boolean paymentSuccessful = creditCardService.processPayment(fromUser, amount);
        if (paymentSuccessful && toUser != null && !fromUser.getId().equals(toUser.getId())) {
            bankService.credit(toUser, amount);
            log.info("Credited {} to recipient's bank account.", amount);
        }
        return paymentSuccessful;
    }

    private boolean processBankTransfer(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing bank transfer from user: {} to user: {}", fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM");
        try {
            bankService.debit(fromUser, amount);
            if (toUser != null && !fromUser.getId().equals(toUser.getId())) {
                bankService.credit(toUser, amount);
            }
            log.info("Bank transfer successful.");
            return true;
        } catch (BusinessException e) {
            log.error("Error during bank transfer: {}", e.getMessage());
            throw e;
        }
    }

    private boolean processEWalletPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        log.info("Processing eWallet payment from user: {} to user: {}", fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM");
        try {
            eWalletService.processEWalletPayment(fromUser, toUser, amount, listingId);
            log.info("eWallet payment successful.");
            return true;
        } catch (BusinessException e) {
            log.error("Error during eWallet payment: {}", e.getMessage());
            throw e;
        }
    }
}
