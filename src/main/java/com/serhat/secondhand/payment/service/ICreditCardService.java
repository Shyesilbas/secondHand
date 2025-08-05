package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public interface ICreditCardService {
    
    boolean validateCreditCard(CreditCardDto creditCardDto);
    boolean processPayment(CreditCardDto creditCardDto, BigDecimal amount);
    CreditCard saveCreditCard(CreditCardDto creditCardDto);
    CreditCardDto createCreditCard(User user, CreditCardRequest creditCardRequest);
    boolean hasAvailableCredit(CreditCardDto creditCardDto, BigDecimal amount);
    String maskCardNumber(String cardNumber);
    CreditCard findById(UUID id);
    CreditCard findByUser(User user);
    CreditCardDto getUserCreditCardDto(User user);
    boolean hasUserCreditCard(User user);
    
    // Controller-specific methods with Authentication
    CreditCardDto createCreditCard(CreditCardRequest creditCardRequest, Authentication authentication);
    CreditCardDto getUserCreditCard(Authentication authentication);
    Map<String, Object> validateCreditCardRequest(CreditCardDto creditCardDto);
    Map<String, Object> checkCreditCardExists(Authentication authentication);
    Map<String, Object> getAvailableCredit(BigDecimal requestedAmount, Authentication authentication);
}
