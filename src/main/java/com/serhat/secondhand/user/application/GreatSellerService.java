package com.serhat.secondhand.user.application;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.review.repository.ReviewRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GreatSellerService {

    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;

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

        long reviewers = reviewRepository.countDistinctReviewersByReviewedUserId(sellerId);
        double avgRating = rawAverageRatingForReviewedUser(sellerId);

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

    /** Anasayfa: satış şartı tek GROUP BY ile; yorum için mevcut iki repository metodu (yinelenen JPQL yok). */
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

        List<Long> qualifyingOrder = new ArrayList<>();
        for (Object[] row : rows) {
            Long sid = (Long) row[0];
            if (!passesGreatSellerReviewCriteria(sid)) {
                continue;
            }
            qualifyingOrder.add(sid);
            if (qualifyingOrder.size() >= safeLimit * 4) {
                break;
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
                out.add(GreatSellerPublicProfileDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .surname(u.getSurname())
                        .build());
                if (out.size() >= safeLimit) {
                    break;
                }
            }
        }
        return out;
    }

    private static final int MAX_SALES_ROW_SCAN = 120;

    private boolean passesGreatSellerReviewCriteria(Long sellerId) {
        long reviewers = reviewRepository.countDistinctReviewersByReviewedUserId(sellerId);
        double avg = rawAverageRatingForReviewedUser(sellerId);
        return reviewers >= GreatSellerPolicy.MIN_DISTINCT_REVIEWERS
                && avg >= GreatSellerPolicy.MIN_AVERAGE_RATING;
    }

    private double rawAverageRatingForReviewedUser(Long sellerId) {
        Double d = reviewRepository.getUserAverageRating(sellerId);
        return d != null ? d : 0.0;
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
}
