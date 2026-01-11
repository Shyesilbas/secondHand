package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentStatsService {

    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final PaymentMapper paymentMapper;
    private final ListingService listingService;

    public Map<String, Object> getPaymentStatistics(Authentication authentication, PaymentType filterType) {
        // Payment stats for specific payment type
        User user = userService.getAuthenticatedUser(authentication);
        var payments = paymentRepository.findByFromUserOrToUser(user, user);
        if (filterType != null) {
            payments = payments.stream().filter(p -> p.getPaymentType() == filterType).toList();
        }

        long total = payments.size();
        long successful = payments.stream().filter(Payment::isSuccess).count();
        BigDecimal totalAmount = payments.stream().filter(Payment::isSuccess)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalPayments", total,
                "successfulPayments", successful,
                "failedPayments", total - successful,
                "successRate", total > 0 ? (double) successful / total * 100 : 0,
                "totalAmount", totalAmount
        );
    }

    public Map<String, Object> getPaymentStatistics(Authentication authentication) {
        return getPaymentStatistics(authentication, null);
    }

    public Page<PaymentDto> getMyPayments(Authentication authentication, int page, int size) {
        return getMyPayments(authentication, page, size, null, null, null, null, null, null, null, null);
    }

    public Page<PaymentDto> getMyPayments(
            Authentication authentication,
            int page,
            int size,
            PaymentTransactionType transactionType,
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal amountMin,
            BigDecimal amountMax,
            String sellerName) {
        User user = userService.getAuthenticatedUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "processedAt"));
        
        Page<Payment> payments;
        if (hasFilters(transactionType, paymentType, paymentDirection, dateFrom, dateTo, amountMin, amountMax, sellerName)) {
            payments = paymentRepository.findByFilters(
                    user, user,
                    transactionType,
                    paymentType,
                    paymentDirection,
                    dateFrom,
                    dateTo,
                    amountMin,
                    amountMax,
                    sellerName != null && !sellerName.trim().isEmpty() ? sellerName.trim() : null,
                    pageable
            );
        } else {
            payments = paymentRepository.findByFromUserOrToUser(user, user, pageable);
        }
        
        return payments.map(payment -> mapPaymentToDtoWithListingInfo(payment, user));
    }

    private boolean hasFilters(
            PaymentTransactionType transactionType,
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal amountMin,
            BigDecimal amountMax,
            String sellerName) {
        return transactionType != null ||
               paymentType != null ||
               paymentDirection != null ||
               dateFrom != null ||
               dateTo != null ||
               amountMin != null ||
               amountMax != null ||
               (sellerName != null && !sellerName.trim().isEmpty());
    }

    private PaymentDto mapPaymentToDtoWithListingInfo(Payment payment, User currentUser) {
        PaymentDto baseDto = paymentMapper.toDto(payment);
        String listingTitle = null;
        String listingNo = null;

        if (payment.getListingId() != null) {
            Optional<Listing> listing = listingService.findById(payment.getListingId());
            if (listing.isPresent()) {
                listingTitle = listing.get().getTitle();
                listingNo = listing.get().getListingNo();
            }
        }

        PaymentDirection direction;
        PaymentTransactionType transactionType;

        boolean isEwalletFlow = payment.getTransactionType() == PaymentTransactionType.EWALLET_DEPOSIT
                || payment.getTransactionType() == PaymentTransactionType.EWALLET_WITHDRAWAL
                || payment.getTransactionType() == PaymentTransactionType.EWALLET_PAYMENT_RECEIVED;

        if (payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION ||
                payment.getTransactionType() == PaymentTransactionType.SHOWCASE_PAYMENT ||
                payment.getTransactionType() == PaymentTransactionType.REFUND ||
                isEwalletFlow) {
            direction = payment.getPaymentDirection();
            transactionType = payment.getTransactionType();
        } else {
            if (payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUser.getId())) {
                direction = PaymentDirection.OUTGOING;
                transactionType = PaymentTransactionType.ITEM_PURCHASE;
            } else {
                direction = PaymentDirection.INCOMING;
                transactionType = PaymentTransactionType.ITEM_SALE;
            }
        }

        return new PaymentDto(
                baseDto.paymentId(),
                baseDto.senderName(),
                baseDto.senderSurname(),
                baseDto.receiverName(),
                baseDto.receiverSurname(),
                baseDto.amount(),
                baseDto.paymentType(),
                transactionType,
                direction,
                baseDto.listingId(),
                listingTitle,
                listingNo,
                baseDto.createdAt(),
                baseDto.isSuccess()
        );
    }



}
