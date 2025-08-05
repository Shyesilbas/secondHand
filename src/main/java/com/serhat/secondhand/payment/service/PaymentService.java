package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.repo.BankRepository;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;
    private final ICreditCardService creditCardService;

    @Override
    public List<PaymentDto> getPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(payment -> new PaymentDto(
                        payment.getId(),
                        payment.getFromUser().getName(),
                        payment.getFromUser().getSurname(),
                        payment.getToUser().getName(),
                        payment.getToUser().getSurname(),
                        payment.getAmount(),
                        payment.getPaymentType(),
                        payment.getTransactionType(),
                        payment.getPaymentDirection(),
                        payment.getListingId(),
                        payment.getProcessedAt(),
                        payment.isSuccess()
                )).toList();
    }

    @Override
    @Transactional
    public PaymentDto createPayment(PaymentRequest paymentRequest) {
        log.info("Creating payment for listing: {} with amount: {}", 
                 paymentRequest.listingId(), paymentRequest.amount());

        // Get current authenticated user (payer)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        User fromUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.toString()));

        // Get recipient user
        User toUser = userRepository.findById(paymentRequest.toUserId())
                .orElseThrow(() -> new BusinessException("Recipient user not found", HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.toString()));

        // Validate payment amount
        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero", 
                                      HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
        }

        // Validate that user is not paying themselves
        if (fromUser.getId().equals(toUser.getId())) {
            throw new BusinessException("Cannot make payment to yourself", 
                                      HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
        }

        boolean paymentSuccessful = false;
        
        try {
            // Process payment based on payment type
            if (paymentRequest.paymentType() == PaymentType.CREDIT_CARD) {
                paymentSuccessful = processCreditCardPayment(paymentRequest, fromUser, toUser);
            } else if (paymentRequest.paymentType() == PaymentType.TRANSFER) {
                paymentSuccessful = processBankTransfer(paymentRequest, fromUser, toUser);
            } else {
                throw new BusinessException("Unsupported payment type", 
                                          HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
            }

            // Create and save payment record
            Payment payment = Payment.builder()
                    .fromUser(fromUser)
                    .toUser(toUser)
                    .amount(paymentRequest.amount())
                    .paymentType(paymentRequest.paymentType())
                    .transactionType(paymentRequest.transactionType())
                    .paymentDirection(paymentRequest.paymentDirection())
                    .listingId(paymentRequest.listingId())
                    .processedAt(LocalDateTime.now())
                    .isSuccess(paymentSuccessful)
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            log.info("Payment {} created with ID: {}", 
                     paymentSuccessful ? "successfully" : "unsuccessfully", savedPayment.getId());

            return new PaymentDto(
                    savedPayment.getId(),
                    savedPayment.getFromUser().getName(),
                    savedPayment.getFromUser().getSurname(),
                    savedPayment.getToUser().getName(),
                    savedPayment.getToUser().getSurname(),
                    savedPayment.getAmount(),
                    savedPayment.getPaymentType(),
                    savedPayment.getTransactionType(),
                    savedPayment.getPaymentDirection(),
                    savedPayment.getListingId(),
                    savedPayment.getProcessedAt(),
                    savedPayment.isSuccess()
            );

        } catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage(), e);
            throw new BusinessException("Payment processing failed: " + e.getMessage(), 
                                      HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
    }

    private boolean processCreditCardPayment(PaymentRequest paymentRequest, User fromUser, User toUser) {
        if (paymentRequest.creditCard() == null) {
            throw new BusinessException("Credit card information is required for credit card payments", 
                                      HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
        }

        log.info("Processing credit card payment from user: {} to user: {}", 
                 fromUser.getEmail(), toUser.getEmail());

        // Process credit card payment
        boolean paymentSuccessful = creditCardService.processPayment(paymentRequest.creditCard(), paymentRequest.amount());

        if (paymentSuccessful) {
            // If payment successful, add money to recipient's bank account
            Bank toUserBank = bankRepository.findByAccountHolder(toUser);
            if (toUserBank != null) {
                BigDecimal currentBalance = toUserBank.getBalance();
                toUserBank.setBalance(currentBalance.add(paymentRequest.amount()));
                bankRepository.save(toUserBank);
                log.info("Added {} to recipient's bank account. New balance: {}", 
                         paymentRequest.amount(), toUserBank.getBalance());
            } else {
                log.warn("Recipient user {} does not have a bank account. Payment successful but money not credited.", 
                         toUser.getEmail());
            }
        }

        return paymentSuccessful;
    }

    private boolean processBankTransfer(PaymentRequest paymentRequest, User fromUser, User toUser) {
        log.info("Processing bank transfer from user: {} to user: {}", 
                 fromUser.getEmail(), toUser.getEmail());

        // Get sender's bank account
        Bank fromUserBank = bankRepository.findByAccountHolder(fromUser);
        if (fromUserBank == null) {
            throw new BusinessException("Sender does not have a bank account", 
                                      HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
        }

        // Check if sender has sufficient balance
        if (fromUserBank.getBalance().compareTo(paymentRequest.amount()) < 0) {
            throw new BusinessException("Insufficient balance for transfer", 
                                      HttpStatus.PAYMENT_REQUIRED, HttpStatus.PAYMENT_REQUIRED.toString());
        }

        // Get recipient's bank account
        Bank toUserBank = bankRepository.findByAccountHolder(toUser);
        if (toUserBank == null) {
            throw new BusinessException("Recipient does not have a bank account", 
                                      HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString());
        }

        try {
            // Deduct from sender's account
            BigDecimal senderNewBalance = fromUserBank.getBalance().subtract(paymentRequest.amount());
            fromUserBank.setBalance(senderNewBalance);

            // Add to recipient's account
            BigDecimal recipientNewBalance = toUserBank.getBalance().add(paymentRequest.amount());
            toUserBank.setBalance(recipientNewBalance);

            // Save both accounts
            bankRepository.save(fromUserBank);
            bankRepository.save(toUserBank);

            log.info("Bank transfer successful. Sender new balance: {}, Recipient new balance: {}", 
                     senderNewBalance, recipientNewBalance);

            return true;
        } catch (Exception e) {
            log.error("Error during bank transfer: {}", e.getMessage(), e);
            return false;
        }
    }

    // Controller-specific methods
    
    @Override
    public Map<String, Object> getPaymentsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<PaymentDto> payments = getPayments();
        
        // Manual pagination since repository doesn't return Page
        int start = Math.min((int) pageable.getOffset(), payments.size());
        int end = Math.min((start + pageable.getPageSize()), payments.size());
        List<PaymentDto> pageContent = payments.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("totalElements", payments.size());
        response.put("totalPages", (int) Math.ceil((double) payments.size() / size));
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("hasNext", end < payments.size());
        response.put("hasPrevious", start > 0);
        
        return response;
    }

    @Override
    public Map<String, Object> getPaymentStatistics() {
        List<PaymentDto> payments = getPayments();
        
        long totalPayments = payments.size();
        long successfulPayments = payments.stream().mapToLong(p -> p.isSuccess() ? 1 : 0).sum();
        long failedPayments = totalPayments - successfulPayments;
        
        BigDecimal totalAmount = payments.stream()
                .filter(PaymentDto::isSuccess)
                .map(PaymentDto::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long creditCardPayments = payments.stream()
                .mapToLong(p -> p.paymentType() == PaymentType.CREDIT_CARD ? 1 : 0).sum();
        
        long transferPayments = payments.stream()
                .mapToLong(p -> p.paymentType() == PaymentType.TRANSFER ? 1 : 0).sum();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalPayments", totalPayments);
        statistics.put("successfulPayments", successfulPayments);
        statistics.put("failedPayments", failedPayments);
        statistics.put("successRate", totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0);
        statistics.put("totalAmount", totalAmount);
        statistics.put("creditCardPayments", creditCardPayments);
        statistics.put("transferPayments", transferPayments);
        
        return statistics;
    }

    @Override
    public Map<String, Object> checkUserPaymentCapability(Authentication authentication) {
        // Check if user has at least one payment method
        boolean hasBankAccount = false;
        boolean hasCreditCard = false;
        
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElse(null);
            
            if (user != null) {
                Bank bank = bankRepository.findByAccountHolder(user);
                hasBankAccount = bank != null;
                
                hasCreditCard = creditCardService.hasUserCreditCard(user);
            }
        } catch (Exception e) {
            log.warn("Error checking user payment methods: {}", e.getMessage());
        }
        
        boolean canPay = hasBankAccount || hasCreditCard;
        
        Map<String, Object> response = new HashMap<>();
        response.put("canMakePayments", canPay);
        response.put("hasBankAccount", hasBankAccount);
        response.put("hasCreditCard", hasCreditCard);
        response.put("availablePaymentTypes", canPay ? PaymentType.values() : new PaymentType[]{});
        
        return response;
    }

    @Override
    public Map<String, Object> validatePaymentRequest(PaymentRequest paymentRequest) {
        Map<String, Object> response = new HashMap<>();
        
        // Basic validation
        boolean isValid = true;
        String message = "Payment request is valid";
        
        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            isValid = false;
            message = "Amount must be greater than zero";
        } else if (paymentRequest.toUserId() == null) {
            isValid = false;
            message = "Recipient user ID is required";
        } else if (paymentRequest.paymentType() == null) {
            isValid = false;
            message = "Payment type is required";
        } else if (paymentRequest.transactionType() == null) {
            isValid = false;
            message = "Transaction type is required";
        } else if (paymentRequest.paymentDirection() == null) {
            isValid = false;
            message = "Payment direction is required";
        } else if (paymentRequest.paymentType() == PaymentType.CREDIT_CARD && paymentRequest.creditCard() == null) {
            isValid = false;
            message = "Credit card information is required for credit card payments";
        }
        
        response.put("valid", isValid);
        response.put("message", message);
        response.put("amount", paymentRequest.amount());
        response.put("paymentType", paymentRequest.paymentType());
        response.put("transactionType", paymentRequest.transactionType());
        response.put("paymentDirection", paymentRequest.paymentDirection());
        
        return response;
    }
}
