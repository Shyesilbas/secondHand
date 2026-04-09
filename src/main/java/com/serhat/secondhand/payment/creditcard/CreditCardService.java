package com.serhat.secondhand.payment.creditcard;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import com.serhat.secondhand.payment.mapper.CreditCardMapper;
import com.serhat.secondhand.payment.repository.CreditCardRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final IUserService userService;
    private final CreditCardMapper creditCardMapper;
    private final CreditCardValidator creditCardValidator;

    public CreditCardDto createCreditCard(CreditCardRequest creditCardRequest, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        ensureValid(creditCardValidator.validateForCreate(user, creditCardRequest));

        CreditCard creditCard = creditCardMapper.fromCreateRequest(creditCardRequest, user);
        creditCard = creditCardRepository.save(creditCard);
        log.info("Credit card created for user: {} with masked number: {}", user.getEmail(),
                CreditCardHelper.maskCardNumber(creditCard.getNumber()));

        return creditCardMapper.toDto(creditCard);
    }

    public List<CreditCardDto> getCreditCards(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return creditCardRepository.findAllByCardHolder(user)
                .stream()
                .map(creditCardMapper::toDto)
                .toList();
    }

    public PaymentResult processCreditCardPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        if (fromUser == null) {
            return PaymentResult.failure("User not found", amount, PaymentType.CREDIT_CARD, listingId, null,
                    toUser != null ? toUser.getId() : null);
        }

        /* Ödeme için yeterli limite sahip ilk kartı kullan */
        CreditCard card = creditCardRepository.findAllByCardHolder(fromUser).stream()
                .filter(c -> c.getLimit().subtract(c.getAmount()).compareTo(amount) >= 0)
                .findFirst()
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.INSUFFICIENT_FUNDS));

        ensureValid(creditCardValidator.validateSufficientCredit(card, amount));

        try {
            boolean isSuccessful = Math.random() < PaymentProcessingConstants.CREDIT_CARD_SIMULATION_SUCCESS_RATE;
            if (!isSuccessful) {
                return PaymentResult.failure("Payment processing failed", amount, PaymentType.CREDIT_CARD,
                        listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
            }

            card.setAmount(card.getAmount().add(amount));
            creditCardRepository.save(card);
            log.info("Credit card payment processed for user: {}, amount: {}", fromUser.getEmail(), amount);
            return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.CREDIT_CARD,
                    listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            log.error("Error processing credit card payment for user: {}", fromUser.getEmail(), e);
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.CREDIT_CARD,
                    listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }

    public Optional<CreditCard> findByUser(User user) {
        return creditCardRepository.findAllByCardHolder(user).stream().findFirst();
    }

    public CreditCard findByUserMandatory(User user) {
        return findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND));
    }

    public CreditCard findByUserMandatoryWithLock(User user) {
        /* Ödeme sırasında lock ile ilk kartı al */
        return creditCardRepository.findAllByCardHolder(user).stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND));
    }

    public Map<String, Object> checkCreditCardExists(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        List<CreditCard> cards = creditCardRepository.findAllByCardHolder(user);
        return Map.of(
                "hasCreditCard", !cards.isEmpty(),
                "cardCount", cards.size(),
                "maskedCardNumber", cards.isEmpty() ? null : CreditCardHelper.maskCardNumber(cards.get(0).getNumber())
        );
    }

    public Map<String, Object> getAvailableCredit(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        CreditCard creditCard = findByUserMandatory(user);
        BigDecimal availableCredit = creditCard.getLimit().subtract(creditCard.getAmount());
        return Map.of(
                "availableCredit", availableCredit,
                "creditLimit", creditCard.getLimit(),
                "currentUsage", creditCard.getAmount()
        );
    }

    public void deleteCreditCard(UUID cardId, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        int deleted = creditCardRepository.deleteByIdAndCardHolderId(cardId, user.getId());
        if (deleted == 0) {
            throw new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND);
        }
        log.info("Credit card {} deleted for user: {}", cardId, user.getEmail());
    }

    private void ensureValid(Result<Void> validationResult) {
        if (validationResult.isError()) {
            throw new BusinessException(
                    validationResult.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    validationResult.getErrorCode()
            );
        }
    }
}
