package com.serhat.secondhand.payment.creditcard;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.repo.CreditCardRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CreditCardValidator {

    private final CreditCardRepository creditCardRepository;

    public Result<Void> validateForCreate(User user, CreditCardRequest request) {
        if (creditCardRepository.existsByCardHolder(user)) {
            return Result.error(PaymentErrorCodes.CREDIT_CARD_EXISTS);
        }
        return validateCreditLimit(request.limit());
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
        Optional<CreditCard> creditCard = creditCardRepository.findByCardHolder(user);
        if (creditCard.isEmpty()) {
            return false;
        }
        CreditCard card = creditCard.get();
        BigDecimal availableCredit = card.getLimit().subtract(card.getAmount());
        return availableCredit.compareTo(amount) >= 0;
    }
}

