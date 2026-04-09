package com.serhat.secondhand.payment.creditcard;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.repository.CreditCardRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class CreditCardValidator {

    private final CreditCardRepository creditCardRepository;

    public Result<Void> validateForCreate(User user, CreditCardRequest request) {
        Result<Void> limitResult = validateCreditLimit(request.limit());
        if (limitResult.isError()) return limitResult;

        if (request.isManual()) {
            return validateManualCardInput(request);
        }
        return Result.success();
    }

    /** Kullanıcı manuel kart girişi yaptıysa format + expiry kontrolü */
    private Result<Void> validateManualCardInput(CreditCardRequest request) {
        String cleaned = request.cardNumber().replaceAll("[\\s-]", "");
        if (cleaned.length() < 13 || cleaned.length() > 19 || !cleaned.matches("\\d+")) {
            return Result.error(PaymentErrorCodes.INVALID_CARD_NUMBER);
        }
        if (!isLuhnValid(cleaned)) {
            return Result.error(PaymentErrorCodes.INVALID_CARD_NUMBER);
        }
        if (request.cvv() == null || !request.cvv().matches("\\d{3,4}")) {
            return Result.error(PaymentErrorCodes.INVALID_CVV);
        }
        int month = request.expiryMonth() != null ? request.expiryMonth() : 0;
        int year  = request.expiryYear()  != null ? request.expiryYear()  : 0;
        if (month < 1 || month > 12) {
            return Result.error(PaymentErrorCodes.INVALID_EXPIRY);
        }
        LocalDate now = LocalDate.now();
        if (year < now.getYear() || (year == now.getYear() && month < now.getMonthValue())) {
            return Result.error(PaymentErrorCodes.CARD_EXPIRED);
        }
        return Result.success();
    }

    private boolean isLuhnValid(String number) {
        int sum = 0;
        boolean alternate = false;
        for (int i = number.length() - 1; i >= 0; i--) {
            int n = Character.getNumericValue(number.charAt(i));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }

    public Result<Void> validateCreditLimit(BigDecimal limit) {
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_CREDIT_LIMIT);
        }
        return Result.success();
    }


    public Result<Void> validateSufficientCredit(CreditCard creditCard, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(PaymentErrorCodes.INVALID_AMOUNT);
        }

        BigDecimal availableCredit = creditCard.getLimit().subtract(creditCard.getAmount());
        if (availableCredit.compareTo(amount) < 0) {
            return Result.error(PaymentErrorCodes.INSUFFICIENT_FUNDS);
        }
        return Result.success();
    }


    public boolean hasSufficientCredit(User user, BigDecimal amount) {
        if (user == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        /* Kullanıcının herhangi bir kartında yeterli limit var mı? */
        return creditCardRepository.findAllByCardHolder(user).stream()
                .anyMatch(card -> card.getLimit().subtract(card.getAmount()).compareTo(amount) >= 0);
    }
}

