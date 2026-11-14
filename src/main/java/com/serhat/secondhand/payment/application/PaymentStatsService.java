package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentFilter;
import com.serhat.secondhand.payment.dto.PaymentStatisticsDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PaymentStatsService {

    private final PaymentRepository paymentRepository;
    private final EscrowRepository escrowRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentContextResolver paymentContextResolver;

    // The 'dto_' key prefix keeps entries cached before PaymentStatisticsDto (plain maps) from being read back.
    @Cacheable(value = "payment:stats", key = "'dto_' + #userId + '_' + #providerName")
    public PaymentStatisticsDto getPaymentStatistics(Long userId, String providerName) {
        log.info("[CACHE MISS] payment:stats for userId: {}", userId);

        List<Object[]> statsRows = paymentRepository.getPaymentStats(userId, providerName);
        Object[] stats = statsRows.isEmpty()
                ? new Object[] { 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO }
                : statsRows.get(0);

        long total = stats[0] != null ? ((Number) stats[0]).longValue() : 0;
        long successful = stats[1] != null ? ((Number) stats[1]).longValue() : 0;
        BigDecimal incomingAmount = stats[2] != null ? (BigDecimal) stats[2] : BigDecimal.ZERO;
        BigDecimal outgoingAmount = stats[3] != null ? (BigDecimal) stats[3] : BigDecimal.ZERO;
        BigDecimal escrowAmount;
        if (providerName == null || providerName.isBlank()) {
            BigDecimal pendingEscrow = escrowRepository.sumAmountBySellerIdAndStatus(userId, PaymentStatus.ESCROW);
            escrowAmount = pendingEscrow != null ? pendingEscrow : BigDecimal.ZERO;
        } else {
            escrowAmount = stats[4] != null ? (BigDecimal) stats[4] : BigDecimal.ZERO;
        }

        return new PaymentStatisticsDto(
                total,
                successful,
                total - successful,
                total > 0 ? (double) successful / total * 100 : 0.0,
                incomingAmount,
                outgoingAmount,
                incomingAmount.add(outgoingAmount),
                escrowAmount);
    }

    public Page<PaymentDto> getMyPayments(Long userId, Pageable pageable, PaymentFilter filter) {
        Page<Payment> paymentsPage;
        if (isFilterPresent(filter)) {
            var spec = com.serhat.secondhand.payment.repository.spec.PaymentSpecification.withFilters(
                    userId,
                    filter.transactionType(),
                    filter.providerName(),
                    filter.paymentDirection(),
                    filter.dateFrom(),
                    filter.dateTo(),
                    filter.amountMin(),
                    filter.amountMax(),
                    filter.searchTerm());
            paymentsPage = paymentRepository.findAll(spec, pageable);
        } else {
            paymentsPage = paymentRepository.findByUserId(userId, pageable);
        }

        return paymentsPage.map(payment -> mapPaymentToDtoOptimized(payment, userId));
    }

    private boolean isFilterPresent(PaymentFilter filter) {
        if (filter == null)
            return false;
        return filter.transactionType() != null ||
                filter.providerName() != null ||
                filter.paymentDirection() != null ||
                filter.dateFrom() != null ||
                filter.dateTo() != null ||
                filter.amountMin() != null ||
                filter.amountMax() != null ||
                (filter.searchTerm() != null && !filter.searchTerm().isBlank());
    }

    private PaymentDto mapPaymentToDtoOptimized(Payment payment, Long currentUserId) {
        PaymentDto baseDto = paymentMapper.toDto(payment);
        var inferredData = paymentContextResolver.resolve(payment, currentUserId);

        return new PaymentDto(
                baseDto.paymentId(),
                baseDto.senderDisplayName(),
                baseDto.receiverDisplayName(),
                baseDto.amount(),
                baseDto.currency(),
                baseDto.providerName(),
                baseDto.providerTransactionId(),
                inferredData.transactionType(),
                inferredData.direction(),
                baseDto.listingId(),
                payment.getListingTitle(), // Direct snapshot
                payment.getListingNo(), // Direct snapshot
                baseDto.processedAt(),
                baseDto.status(),
                baseDto.isSuccess(),
                baseDto.description());
    }
}
