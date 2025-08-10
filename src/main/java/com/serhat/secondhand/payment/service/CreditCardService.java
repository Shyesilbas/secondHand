package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import com.serhat.secondhand.payment.repo.CreditCardRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final UserService userService;

    public CreditCardDto createCreditCard(CreditCardRequest creditCardRequest, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);

        if (creditCardRepository.existsByCardHolder(user)) {
            throw new BusinessException("User already has a credit card", HttpStatus.CONFLICT, "CREDIT_CARD_EXISTS");
        }
        if (creditCardRequest.limit() == null || creditCardRequest.limit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Credit limit must be greater than zero", HttpStatus.BAD_REQUEST, "INVALID_LIMIT");
        }

        CreditCard creditCard = CreditCard.builder()
                .cardHolder(user)
                .number(CreditCardHelper.generateCardNumber())
                .cvv(CreditCardHelper.generateCvv())
                .expiryMonth(CreditCardHelper.generateExpiryMonth())
                .expiryYear(CreditCardHelper.generateExpiryYear())
                .amount(BigDecimal.ZERO) // Initial amount is zero
                .limit(creditCardRequest.limit())
                .createdAt(LocalDateTime.now())
                .build();

        creditCard = creditCardRepository.save(creditCard);
        log.info("Credit card created for user: {} with masked number: {}", user.getEmail(), CreditCardHelper.maskCardNumber(creditCard.getNumber()));

        return toDto(creditCard);
    }

    public CreditCardDto getCreditCard(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        CreditCard creditCard = findByUserMandatory(user);
        return toDto(creditCard);
    }
    
    public boolean processPayment(User user, BigDecimal amount) {
        CreditCard card = findByUserMandatory(user);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Invalid payment amount", HttpStatus.BAD_REQUEST, "INVALID_AMOUNT");
        }
        
        BigDecimal availableCredit = card.getLimit().subtract(card.getAmount());
        if (availableCredit.compareTo(amount) < 0) {
            log.warn("Insufficient credit limit for user: {}. Available: {}, Requested: {}", user.getEmail(), availableCredit, amount);
            return false;
        }

        try {
            log.info("Processing payment of {} for card ending with: {}", amount, CreditCardHelper.maskCardNumber(card.getNumber()));

            boolean isSuccessful = Math.random() > 0.05;

            if (isSuccessful) {
                card.setAmount(card.getAmount().add(amount));
                creditCardRepository.save(card);
                log.info("Payment processed successfully for amount: {}. New card balance: {}", amount, card.getAmount());
                return true;
            } else {
                log.warn("Payment processing failed for amount: {}", amount);
                return false;
            }
        } catch (Exception e) {
            log.error("Error processing payment for user {}", user.getEmail(), e);
            return false;
        }
    }

    public Optional<CreditCard> findByUser(User user) {
        return creditCardRepository.findByCardHolder(user);
    }

    public CreditCard findByUserMandatory(User user) {
        return findByUser(user)
                .orElseThrow(() -> new BusinessException("User does not have a credit card", HttpStatus.NOT_FOUND, "CREDIT_CARD_NOT_FOUND"));
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

    private CreditCardDto toDto(CreditCard creditCard) {
        return new CreditCardDto(
                CreditCardHelper.maskCardNumber(creditCard.getNumber()),
                "***",
                String.valueOf(creditCard.getExpiryMonth()),
                String.valueOf(creditCard.getExpiryYear()),
                creditCard.getAmount().toString(),
                creditCard.getLimit().toString()
        );
    }
}
