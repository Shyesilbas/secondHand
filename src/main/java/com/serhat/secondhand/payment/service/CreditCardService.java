package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import com.serhat.secondhand.payment.repo.CreditCardRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardService implements ICreditCardService {

    private final CreditCardRepository creditCardRepository;

    @Override
    public boolean validateCreditCard(CreditCardDto creditCardDto) {
        if (creditCardDto == null) {
            log.warn("Credit card DTO is null");
            return false;
        }

        // Validate card number
        if (!CreditCardHelper.isValidCardNumber(creditCardDto.number())) {
            log.warn("Invalid card number provided");
            return false;
        }

        // Validate CVV
        if (!CreditCardHelper.isValidCvv(creditCardDto.cvv())) {
            log.warn("Invalid CVV provided");
            return false;
        }

        // Validate expiry date
        try {
            int month = Integer.parseInt(creditCardDto.expiryMonth());
            int year = Integer.parseInt(creditCardDto.expiryYear());
            
            if (!CreditCardHelper.isValidExpiryDate(month, year)) {
                log.warn("Credit card has expired or invalid expiry date");
                return false;
            }
        } catch (NumberFormatException e) {
            log.warn("Invalid expiry date format");
            return false;
        }

        log.info("Credit card validation successful for card ending with: {}", 
                 CreditCardHelper.maskCardNumber(creditCardDto.number()));
        return true;
    }

    @Override
    public boolean processPayment(CreditCardDto creditCardDto, BigDecimal amount) {
        if (!validateCreditCard(creditCardDto)) {
            throw new BusinessException("Invalid credit card details", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Invalid payment amount", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        // Check available credit
        if (!hasAvailableCredit(creditCardDto, amount)) {
            throw new BusinessException("Insufficient credit limit", 
                                      HttpStatus.PAYMENT_REQUIRED, 
                                      HttpStatus.PAYMENT_REQUIRED.toString());
        }

        // Simulate payment processing
        try {
            // In a real implementation, this would connect to a payment gateway
            log.info("Processing payment of {} for card ending with: {}", 
                     amount, CreditCardHelper.maskCardNumber(creditCardDto.number()));
            
            // Simulate processing time
            Thread.sleep(1000);
            
            // Simulate success rate (95% success rate for demo)
            double successRate = Math.random();
            boolean isSuccessful = successRate > 0.05;
            
            if (isSuccessful) {
                log.info("Payment processed successfully for amount: {}", amount);
                return true;
            } else {
                log.warn("Payment processing failed for amount: {}", amount);
                return false;
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing interrupted", e);
            return false;
        } catch (Exception e) {
            log.error("Error processing payment", e);
            return false;
        }
    }

    @Override
    public CreditCard saveCreditCard(CreditCardDto creditCardDto) {
        if (!validateCreditCard(creditCardDto)) {
            throw new BusinessException("Cannot save invalid credit card", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        try {
            CreditCard creditCard = new CreditCard();
            creditCard.setNumber(creditCardDto.number());
            creditCard.setCvv(creditCardDto.cvv());
            creditCard.setExpiryMonth(Integer.parseInt(creditCardDto.expiryMonth()));
            creditCard.setExpiryYear(Integer.parseInt(creditCardDto.expiryYear()));
            creditCard.setAmount(new BigDecimal(creditCardDto.amount()));
            creditCard.setLimit(new BigDecimal(creditCardDto.limit()));
            creditCard.setCreatedAt(LocalDateTime.now());

            CreditCard savedCard = creditCardRepository.save(creditCard);
            log.info("Credit card saved with ID: {}", savedCard.getId());
            return savedCard;
        } catch (NumberFormatException e) {
            throw new BusinessException("Invalid numeric values in credit card data", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }
    }



    @Override
    public CreditCardDto createCreditCard(User user, CreditCardRequest creditCardRequest) {
        if (hasUserCreditCard(user)) {
            throw new BusinessException("User already has a credit card", 
                                      HttpStatus.CONFLICT, 
                                      HttpStatus.CONFLICT.toString());
        }

        if (creditCardRequest.limit() == null || creditCardRequest.limit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Credit limit must be greater than zero", 
                                      HttpStatus.BAD_REQUEST, 
                                      HttpStatus.BAD_REQUEST.toString());
        }

        String cardNumber = CreditCardHelper.generateCardNumber();
        String cvv = CreditCardHelper.generateCvv();
        int expiryMonth = CreditCardHelper.generateExpiryMonth();
        int expiryYear = CreditCardHelper.generateExpiryYear();

        CreditCard creditCard = CreditCard.builder()
                .cardHolder(user)
                .number(cardNumber)
                .cvv(cvv)
                .expiryMonth(expiryMonth)
                .expiryYear(expiryYear)
                .amount(BigDecimal.ZERO)
                .limit(creditCardRequest.limit())
                .createdAt(LocalDateTime.now())
                .build();

        CreditCard savedCard = creditCardRepository.save(creditCard);
        log.info("Credit card created for user: {} with masked number: {} and limit: {}", 
                 user.getEmail(), CreditCardHelper.maskCardNumber(cardNumber), creditCardRequest.limit());

        // Convert to DTO and return
        return new CreditCardDto(
                CreditCardHelper.maskCardNumber(savedCard.getNumber()),
                "***", //
                String.valueOf(savedCard.getExpiryMonth()),
                String.valueOf(savedCard.getExpiryYear()),
                savedCard.getAmount().toString(),
                savedCard.getLimit().toString()
        );
    }

    @Override
    public boolean hasAvailableCredit(CreditCardDto creditCardDto, BigDecimal amount) {
        try {
            BigDecimal currentAmount = new BigDecimal(creditCardDto.amount());
            BigDecimal creditLimit = new BigDecimal(creditCardDto.limit());
            
            return CreditCardHelper.hasAvailableCredit(currentAmount, creditLimit, amount);
        } catch (NumberFormatException e) {
            log.error("Invalid numeric format in credit card amounts", e);
            return false;
        }
    }

    @Override
    public String maskCardNumber(String cardNumber) {
        return CreditCardHelper.maskCardNumber(cardNumber);
    }

    @Override
    public CreditCard findById(UUID id) {
        return creditCardRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Credit card not found", 
                                                      HttpStatus.NOT_FOUND, 
                                                      HttpStatus.NOT_FOUND.toString()));
    }

    @Override
    public CreditCard findByUser(User user) {
        return creditCardRepository.findByCardHolder(user)
                .orElseThrow(() -> new BusinessException("User does not have a credit card", 
                                                      HttpStatus.NOT_FOUND, 
                                                      HttpStatus.NOT_FOUND.toString()));
    }

    @Override
    public CreditCardDto getUserCreditCardDto(User user) {
        CreditCard creditCard = findByUser(user);
        
        return new CreditCardDto(
                CreditCardHelper.maskCardNumber(creditCard.getNumber()),
                "***", // CVV should not be returned for security
                String.valueOf(creditCard.getExpiryMonth()),
                String.valueOf(creditCard.getExpiryYear()),
                creditCard.getAmount().toString(),
                creditCard.getLimit().toString()
        );
    }

    @Override
    public boolean hasUserCreditCard(User user) {
        return creditCardRepository.existsByCardHolder(user);
    }
}
