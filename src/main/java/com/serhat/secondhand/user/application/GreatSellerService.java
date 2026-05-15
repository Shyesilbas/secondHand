package com.serhat.secondhand.user.application;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.repository.projection.GreatSellerReviewMetrics;
import com.serhat.secondhand.user.domain.dto.GreatSellerPublicProfileDto;
import com.serhat.secondhand.user.domain.dto.GreatSellerStatusDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.greatseller.GreatSellerPolicy;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GreatSellerService {

    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;

    private static final int MAX_SALES_ROW_SCAN = 120;

    @Transactional(readOnly = true)
    public GreatSellerStatusDto getStatus(Long sellerId) {
        if (sellerId == null || !userRepository.existsById(sellerId)) {
            return emptyStatus();
        }

        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(GreatSellerPolicy.ROLLING_WINDOW_DAYS);

        long salesCount = orderItemRepository.countGreatSellerEligibleSales(
                sellerId,
                PaymentStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.REFUNDED,
                start,
                end,
                GreatSellerPolicy.MIN_UNIT_PRICE_TRY,
                Currency.TRY);

        GreatSellerReviewMetrics m = reviewRepository.getGreatSellerReviewMetrics(sellerId);
        long reviewers = m != null && m.getDistinctReviewerCount() != null ? m.getDistinctReviewerCount() : 0;
        double avgRating = m != null && m.getAverageRating() != null ? m.getAverageRating() : 0.0;

        boolean salesMet = salesCount >= GreatSellerPolicy.MIN_QUALIFYING_SALES;
        boolean reviewersMet = reviewers >= GreatSellerPolicy.MIN_DISTINCT_REVIEWERS;
        boolean ratingMet = avgRating >= GreatSellerPolicy.MIN_AVERAGE_RATING;

        return GreatSellerStatusDto.builder()
                .eligible(salesMet && reviewersMet && ratingMet)
                .qualifyingSalesLastWindow(Math.toIntExact(Math.min(salesCount, Integer.MAX_VALUE)))
                .qualifyingSalesTarget(GreatSellerPolicy.MIN_QUALIFYING_SALES)
                .salesMet(salesMet)
                .distinctReviewerCount(Math.toIntExact(Math.min(reviewers, Integer.MAX_VALUE)))
                .distinctReviewerTarget(GreatSellerPolicy.MIN_DISTINCT_REVIEWERS)
                .reviewersMet(reviewersMet)
                .averageRating(round2(avgRating))
                .minimumAverageRating(GreatSellerPolicy.MIN_AVERAGE_RATING)
                .ratingMet(ratingMet)
                .minUnitPriceThreshold(GreatSellerPolicy.MIN_UNIT_PRICE_TRY)
                .rollingWindowDays(GreatSellerPolicy.ROLLING_WINDOW_DAYS)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<Long, Boolean> eligibleFlagsBySellerIds(Collection<Long> sellerIds) {
        if (sellerIds == null || sellerIds.isEmpty()) {
            return Map.of();
        }
        Set<Long> unique = sellerIds.stream().filter(Objects::nonNull).collect(Collectors.toCollection(LinkedHashSet::new));
        if (unique.isEmpty()) {
            return Map.of();
        }
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(GreatSellerPolicy.ROLLING_WINDOW_DAYS);

        Map<Long, Long> salesBySeller = new HashMap<>();
        List<Object[]> salesRows = orderItemRepository.countGreatSellerEligibleSalesBySellerIds(
                unique,
                PaymentStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.REFUNDED,
                start,
                end,
                GreatSellerPolicy.MIN_UNIT_PRICE_TRY,
                Currency.TRY);
        for (Object[] row : salesRows) {
            salesBySeller.put((Long) row[0], ((Number) row[1]).longValue());
        }

        Map<Long, ReviewAgg> reviewBySeller = loadReviewAggregates(new ArrayList<>(unique));

        Map<Long, Boolean> out = new HashMap<>();
        for (Long id : unique) {
            long sales = salesBySeller.getOrDefault(id, 0L);
            ReviewAgg agg = reviewBySeller.getOrDefault(id, ReviewAgg.ZERO);
            boolean salesMet = sales >= GreatSellerPolicy.MIN_QUALIFYING_SALES;
            boolean eligible = salesMet && passesGreatSellerReviewCriteria(agg);
            out.put(id, eligible);
        }
        return out;
    }

    /** Anasayfa: satış şartı tek GROUP BY; yorum metrikleri toplu (N+1 yok). */
    @Transactional(readOnly = true)
    public List<GreatSellerPublicProfileDto> listGreatSellerProfiles(int limit) {
        int safeLimit = Math.max(1, Math.min(48, limit));
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(GreatSellerPolicy.ROLLING_WINDOW_DAYS);
        List<Object[]> rows = orderItemRepository.findSellerIdsWithGreatSellerEligibleSalesVolume(
                PaymentStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.REFUNDED,
                start,
                end,
                GreatSellerPolicy.MIN_UNIT_PRICE_TRY,
                Currency.TRY,
                GreatSellerPolicy.MIN_QUALIFYING_SALES,
                PageRequest.of(0, MAX_SALES_ROW_SCAN));

        List<Long> candidateSalesOrder = new ArrayList<>();
        for (Object[] row : rows) {
            candidateSalesOrder.add((Long) row[0]);
            if (candidateSalesOrder.size() >= safeLimit * 4) {
                break;
            }
        }
        if (candidateSalesOrder.isEmpty()) {
            return List.of();
        }

        Map<Long, ReviewAgg> reviewAggBySeller = loadReviewAggregates(candidateSalesOrder);

        List<Long> qualifyingOrder = new ArrayList<>();
        for (Long sid : candidateSalesOrder) {
            ReviewAgg agg = reviewAggBySeller.getOrDefault(sid, ReviewAgg.ZERO);
            if (passesGreatSellerReviewCriteria(agg)) {
                qualifyingOrder.add(sid);
                if (qualifyingOrder.size() >= safeLimit * 4) {
                    break;
                }
            }
        }
        if (qualifyingOrder.isEmpty()) {
            return List.of();
        }

        Map<Long, User> byId = userRepository.findAllById(qualifyingOrder).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<GreatSellerPublicProfileDto> out = new ArrayList<>();
        for (Long id : qualifyingOrder) {
            User u = byId.get(id);
            if (u != null && u.getAccountStatus() == AccountStatus.ACTIVE) {
                ReviewAgg agg = reviewAggBySeller.getOrDefault(id, ReviewAgg.ZERO);
                out.add(GreatSellerPublicProfileDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .surname(u.getSurname())
                        .averageRating(round2(agg.averageRating))
                        .createdAt(u.getAccountCreationDate().atStartOfDay())
                        .build());
                if (out.size() >= safeLimit) {
                    break;
                }
            }
        }
        return out;
    }

    private Map<Long, ReviewAgg> loadReviewAggregates(List<Long> sellerIds) {
        if (sellerIds.isEmpty()) {
            return Map.of();
        }
        List<Object[]> aggRows = reviewRepository.aggregateGreatSellerReviewMetricsBySellerIds(sellerIds);
        Map<Long, ReviewAgg> map = new HashMap<>();
        for (Object[] row : aggRows) {
            Long sid = (Long) row[0];
            long reviewers = ((Number) row[1]).longValue();
            double avg = ((Number) row[2]).doubleValue();
            map.put(sid, new ReviewAgg(reviewers, avg));
        }
        return map;
    }

    private static boolean passesGreatSellerReviewCriteria(ReviewAgg agg) {
        return agg.distinctReviewers >= GreatSellerPolicy.MIN_DISTINCT_REVIEWERS
                && agg.averageRating >= GreatSellerPolicy.MIN_AVERAGE_RATING;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private GreatSellerStatusDto emptyStatus() {
        return GreatSellerStatusDto.builder()
                .eligible(false)
                .qualifyingSalesLastWindow(0)
                .qualifyingSalesTarget(GreatSellerPolicy.MIN_QUALIFYING_SALES)
                .salesMet(false)
                .distinctReviewerCount(0)
                .distinctReviewerTarget(GreatSellerPolicy.MIN_DISTINCT_REVIEWERS)
                .reviewersMet(false)
                .averageRating(0.0)
                .minimumAverageRating(GreatSellerPolicy.MIN_AVERAGE_RATING)
                .ratingMet(false)
                .minUnitPriceThreshold(GreatSellerPolicy.MIN_UNIT_PRICE_TRY)
                .rollingWindowDays(GreatSellerPolicy.ROLLING_WINDOW_DAYS)
                .build();
    }

    private record ReviewAgg(long distinctReviewers, double averageRating) {
        static final ReviewAgg ZERO = new ReviewAgg(0L, 0.0);
    }
}
