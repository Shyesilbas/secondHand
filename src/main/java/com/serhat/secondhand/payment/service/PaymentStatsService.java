package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentFilter;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PaymentStatsService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ListingService listingService;

    public Map<String, Object> getPaymentStatistics(Long userId, PaymentType filterType) {
        log.info("Calculating payment statistics via DB for userId: {}", userId);

        Object[] stats = paymentRepository.getPaymentStats(userId, filterType);

        long total = (long) stats[0];
        long successful = stats[1] != null ? ((Number) stats[1]).longValue() : 0;
        BigDecimal totalAmount = stats[2] != null ? (BigDecimal) stats[2] : BigDecimal.ZERO;

        return Map.of(
                "totalPayments", total,
                "successfulPayments", successful,
                "failedPayments", total - successful,
                "successRate", total > 0 ? (double) successful / total * 100 : 0,
                "totalAmount", totalAmount
        );
    }

    public Page<PaymentDto> getMyPayments(Long userId, Pageable pageable, PaymentFilter filter) {
        Page<Payment> paymentsPage = isFilterPresent(filter)
                ? paymentRepository.findByFilters(userId, filter.transactionType(), filter.paymentType(), filter.paymentDirection(), filter.dateFrom(), filter.dateTo(), filter.amountMin(), filter.amountMax(), (filter.sellerName() != null && !filter.sellerName().isBlank()) ? filter.sellerName().trim() : null, pageable)
                : paymentRepository.findByUserId(userId, pageable);

        List<UUID> listingIds = paymentsPage.getContent().stream()
                .map(Payment::getListingId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<UUID, ListingInfo> listingMap = new java.util.HashMap<>();
        if (!listingIds.isEmpty()) {
            listingMap = listingService.findAllByIds(listingIds).stream()
                    .collect(java.util.stream.Collectors.toMap(
                            Listing::getId,
                            l -> new ListingInfo(l.getTitle(), l.getListingNo())
                    ));
        }

        final Map<UUID, ListingInfo> finalMap = listingMap;
        return paymentsPage.map(payment -> mapPaymentToDtoOptimized(payment, userId, finalMap));
    }

    private boolean isFilterPresent(PaymentFilter filter) {
        if (filter == null) return false;
        return filter.transactionType() != null ||
                filter.paymentType() != null ||
                filter.paymentDirection() != null ||
                filter.dateFrom() != null ||
                filter.dateTo() != null ||
                filter.amountMin() != null ||
                filter.amountMax() != null ||
                (filter.sellerName() != null && !filter.sellerName().isBlank());
    }

    private PaymentDto mapPaymentToDtoOptimized(Payment payment, Long currentUserId, Map<UUID, ListingInfo> listingMap) {
        PaymentDto baseDto = paymentMapper.toDto(payment);

        ListingInfo listingInfo = listingMap.getOrDefault(payment.getListingId(), new ListingInfo(null, null));

        var inferredData = inferTransactionContext(payment, currentUserId);

        return new PaymentDto(
                baseDto.paymentId(),
                baseDto.senderName(),
                baseDto.senderSurname(),
                baseDto.receiverName(),
                baseDto.receiverSurname(),
                baseDto.amount(),
                baseDto.paymentType(),
                inferredData.transactionType(),
                inferredData.direction(),
                baseDto.listingId(),
                listingInfo.title(),
                listingInfo.no(),
                baseDto.createdAt(),
                baseDto.isSuccess()
        );
    }

    private InferredPaymentData inferTransactionContext(Payment payment, Long currentUserId) {
        boolean isSpecialFlow = List.of(
                PaymentTransactionType.LISTING_CREATION,
                PaymentTransactionType.SHOWCASE_PAYMENT,
                PaymentTransactionType.REFUND,
                PaymentTransactionType.EWALLET_DEPOSIT,
                PaymentTransactionType.EWALLET_WITHDRAWAL,
                PaymentTransactionType.EWALLET_PAYMENT_RECEIVED
        ).contains(payment.getTransactionType());

        if (isSpecialFlow) {
            return new InferredPaymentData(payment.getPaymentDirection(), payment.getTransactionType());
        }

        boolean isSender = payment.getFromUser() != null && payment.getFromUser().getId().equals(currentUserId);
        return new InferredPaymentData(
                isSender ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING,
                isSender ? PaymentTransactionType.ITEM_PURCHASE : PaymentTransactionType.ITEM_SALE
        );
    }

    private record ListingInfo(String title, String no) {}
    private record InferredPaymentData(PaymentDirection direction, PaymentTransactionType transactionType) {}
}
