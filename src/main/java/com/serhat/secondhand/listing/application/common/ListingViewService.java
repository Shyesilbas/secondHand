package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.ListingView;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingViewRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.user.application.IUserService;
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
    private final IUserService userService;

    @Async("viewTrackingExecutor")
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
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(ListingBusinessConstants.VIEW_DUPLICATE_WINDOW_HOURS);
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
                    .userAgent(truncateUserAgent(userAgent))
                    .viewedAt(LocalDateTime.now())
                    .build();

            listingViewRepository.save(view);

        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Database error tracking view for listing {}: {}", listingId, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error tracking view for listing {}: {}", listingId, e.getMessage());
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

    private String truncateUserAgent(String userAgent) {
        if (userAgent == null || userAgent.length() <= ListingBusinessConstants.MAX_USER_AGENT_LENGTH) {
            return userAgent;
        }
        return userAgent.substring(0, ListingBusinessConstants.MAX_USER_AGENT_LENGTH);
    }

    @Transactional(readOnly = true)
    public ListingViewStatsDto getViewStatistics(UUID listingId, LocalDateTime startDate, LocalDateTime endDate) {
        if (!listingRepository.existsById(listingId)) {
            throw new com.serhat.secondhand.core.exception.BusinessException(
                com.serhat.secondhand.listing.util.ListingErrorCodes.LISTING_NOT_FOUND);
        }

        int periodDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        
        List<Object[]> stats = listingViewRepository.getViewStatisticsWithDailyBreakdown(listingId, startDate, endDate);
        
        long totalViews = 0;
        long uniqueViews = 0;
        Map<LocalDate, Long> viewsByDate = new HashMap<>();
        
        if (!stats.isEmpty()) {
            Object[] firstRow = stats.get(0);
            totalViews = ((Number) firstRow[0]).longValue();
            uniqueViews = ((Number) firstRow[1]).longValue();
            
            for (Object[] row : stats) {
                LocalDate date = row[2] instanceof Date ? ((java.sql.Date) row[2]).toLocalDate() : (LocalDate) row[2];
                Long count = ((Number) row[3]).longValue();
                viewsByDate.put(date, count);
            }
        }

        return ListingViewStatsDto.builder()
                .totalViews(totalViews)
                .uniqueViews(uniqueViews)
                .periodDays(periodDays)
                .viewsByDate(viewsByDate)
                .build();
    }
}
