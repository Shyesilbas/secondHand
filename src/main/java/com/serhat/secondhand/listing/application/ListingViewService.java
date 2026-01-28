package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.ListingView;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingViewRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingViewService {

    private final ListingViewRepository listingViewRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;

    @Async("viewTrackingExecutor")
    @Transactional
    public void trackView(UUID listingId, Long userId, String sessionId, String ipAddress, String userAgent) {
        try {
            Listing listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

            User user = null;
            if (userId != null) {
                user = userService.findById(userId).getData();
            }

            if (user != null && listing.getSeller().getId().equals(userId)) {
                log.debug("Skipping view tracking for listing {} - user is the owner", listingId);
                return;
            }

            String ipHash = hashIpAddress(ipAddress);
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            boolean isDuplicate = false;

            if (userId != null) {
                isDuplicate = listingViewRepository.existsByListingIdAndUserIdAndViewedAtAfter(listingId, userId, oneHourAgo);
            } else if (sessionId != null) {
                isDuplicate = listingViewRepository.existsByListingIdAndSessionIdAndViewedAtAfter(listingId, sessionId, oneHourAgo);
            }

            if (isDuplicate) return;

            ListingView view = ListingView.builder()
                    .listing(listing)
                    .user(user)
                    .sessionId(sessionId)
                    .ipHash(ipHash)
                    .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                    .viewedAt(LocalDateTime.now())
                    .build();

            listingViewRepository.save(view);

        } catch (Exception e) {
            log.error("Error tracking view for listing {}: {}", listingId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ListingViewStatsDto getAggregatedViewStatisticsForSeller(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> stats = listingViewRepository.getAggregatedStats(sellerId, startDate, endDate);

        Object[] result = stats.get(0);
        long totalViews = result[0] != null ? (long) result[0] : 0L;
        long uniqueViews = result[1] != null ? (long) result[1] : 0L;

        return ListingViewStatsDto.builder()
                .totalViews(totalViews)
                .uniqueViews(uniqueViews)
                .periodDays((int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1)
                .viewsByDate(new HashMap<>())
                .build();
    }


    private String hashIpAddress(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }

    @Transactional(readOnly = true)
    public ListingViewStatsDto getViewStatistics(UUID listingId, LocalDateTime startDate, LocalDateTime endDate) {
        if (!listingRepository.existsById(listingId)) {
            throw new IllegalArgumentException("Listing not found: " + listingId);
        }

        int periodDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

        long totalViews = listingViewRepository.countByListingIdAndViewedAtBetween(listingId, startDate, endDate);

        long uniqueViews = listingViewRepository.countDistinctUserOrSessionByListingAndViewedAtBetween(
                listingId, startDate, endDate);

        Map<LocalDate, Long> viewsByDate = new HashMap<>();
        listingViewRepository.countViewsByDate(listingId, startDate, endDate).forEach(row -> {
            LocalDate date = row[0] instanceof Date ? ((java.sql.Date) row[0]).toLocalDate() : (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            viewsByDate.put(date, count);
        });

        return ListingViewStatsDto.builder()
                .totalViews(totalViews)
                .uniqueViews(uniqueViews)
                .periodDays(periodDays)
                .viewsByDate(viewsByDate)
                .build();
    }
}