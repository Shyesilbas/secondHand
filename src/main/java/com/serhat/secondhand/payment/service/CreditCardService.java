package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import com.serhat.secondhand.payment.mapper.CreditCardMapper;
import com.serhat.secondhand.payment.repo.CreditCardRepository;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.validator.CreditCardValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final UserService userService;
    private final CreditCardMapper creditCardMapper;
    private final CreditCardValidator creditCardValidator;

    public CreditCardDto createCreditCard(CreditCardRequest creditCardRequest, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        creditCardValidator.validateForCreate(user, creditCardRequest);

        CreditCard creditCard = creditCardMapper.fromCreateRequest(creditCardRequest, user);
        creditCard = creditCardRepository.save(creditCard);
        log.info("Credit card created for user: {} with masked number: {}", user.getEmail(), CreditCardHelper.maskCardNumber(creditCard.getNumber()));

        return creditCardMapper.toDto(creditCard);
    }

    public CreditCardDto getCreditCard(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        CreditCard creditCard = findByUserMandatory(user);
        return creditCardMapper.toDto(creditCard);
    }


    public PaymentResult processCreditCardPayment(User fromUser, User toUser, BigDecimal amount, UUID listingId) {
        if (fromUser == null) {
            return PaymentResult.failure("User not found", amount, PaymentType.CREDIT_CARD, listingId, null, toUser != null ? toUser.getId() : null);
        }

        CreditCard card = findByUserMandatoryWithLock(fromUser);
        creditCardValidator.validateSufficientCredit(card, amount);

        try {
            boolean isSuccessful = Math.random() > 0.05;
            if (!isSuccessful) {
                return PaymentResult.failure("Payment processing failed", amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
            }

            card.setAmount(card.getAmount().add(amount));
            creditCardRepository.save(card);
            log.info("Credit card payment processed successfully for user: {}, amount: {}", fromUser.getEmail(), amount);
            return PaymentResult.success(UUID.randomUUID().toString(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        } catch (Exception e) {
            log.error("Error processing credit card payment for user: {}", fromUser.getEmail(), e);
            return PaymentResult.failure(e.getMessage(), amount, PaymentType.CREDIT_CARD, listingId, fromUser.getId(), toUser != null ? toUser.getId() : null);
        }
    }

    public Optional<CreditCard> findByUser(User user) {
        return creditCardRepository.findByCardHolder(user);
    }

    public CreditCard findByUserMandatory(User user) {
        return findByUser(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND));
    }

    public CreditCard findByUserMandatoryWithLock(User user) {
        return creditCardRepository.findByCardHolderWithLock(user)
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.CREDIT_CARD_NOT_FOUND));
    }
    
    public Map<String, Object> checkCreditCardExists(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Optional<CreditCard> cardOpt = findByUser(user);
        return Map.of(
                "hasCreditCard", cardOpt.isPresent(),
                "maskedCardNumber", Objects.requireNonNull(cardOpt.map(c -> CreditCardHelper.maskCardNumber(c.getNumber())).orElse(null))
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

    public void deleteCreditCard(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        CreditCard creditCard = findByUserMandatory(user);
        creditCardRepository.delete(creditCard);
        log.info("Credit card deleted for user: {}", user.getEmail());
    }

    }
