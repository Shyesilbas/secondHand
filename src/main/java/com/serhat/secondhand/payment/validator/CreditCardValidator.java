package com.serhat.secondhand.payment.validator;

import com.serhat.secondhand.core.exception.BusinessException;
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

    public void validateForCreate(User user, CreditCardRequest request) {
        if (creditCardRepository.existsByCardHolder(user)) {
            throw new BusinessException(PaymentErrorCodes.CREDIT_CARD_EXISTS);
        }
        validateCreditLimit(request.limit());
    }

    public void validateCreditLimit(BigDecimal limit) {
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_CREDIT_LIMIT);
        }
    }

    public void validateCreditCardExists(Optional<CreditCard> creditCard) {
        if (creditCard.isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND);
        }
    }

    public void validateSufficientCredit(CreditCard creditCard, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }

        BigDecimal availableCredit = creditCard.getLimit().subtract(creditCard.getAmount());
        if (availableCredit.compareTo(amount) < 0) {
            throw new BusinessException(PaymentErrorCodes.INSUFFICIENT_FUNDS);
        }
    }

    public void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AMOUNT);
        }
    }
}

