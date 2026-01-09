package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.ListingView;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingViewRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingViewService {

    private final ListingViewRepository listingViewRepository;
    private final ListingRepository listingRepository;

    @Async("viewTrackingExecutor")
    @Transactional
    public void trackView(UUID listingId, User user, String sessionId, String ipAddress, String userAgent) {
        try {
            Listing listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

            // Don't track views from the listing owner
            if (user != null && listing.getSeller().getId().equals(user.getId())) {
                log.debug("Skipping view tracking for listing {} - user is the owner", listingId);
                return;
            }

            // Hash IP address for privacy
            String ipHash = hashIpAddress(ipAddress);

            // Check for duplicate views (same user/session within 1 hour)
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            boolean isDuplicate = false;

            if (user != null) {
                isDuplicate = listingViewRepository.existsByListingAndUserAndViewedAtAfter(listing, user, oneHourAgo);
            } else if (sessionId != null) {
                isDuplicate = listingViewRepository.existsByListingAndSessionIdAndViewedAtAfter(listing, sessionId, oneHourAgo);
            }

            if (isDuplicate) {
                log.debug("Duplicate view detected for listing {} by user {} / session {}", 
                        listingId, user != null ? user.getId() : "anonymous", sessionId);
                return;
            }

            // Create and save view
            ListingView view = ListingView.builder()
                    .listing(listing)
                    .user(user)
                    .sessionId(sessionId)
                    .ipHash(ipHash)
                    .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                    .viewedAt(LocalDateTime.now())
                    .build();

            listingViewRepository.save(view);
            log.debug("View tracked for listing {} by user {} / session {}", 
                    listingId, user != null ? user.getId() : "anonymous", sessionId);

        } catch (Exception e) {
            log.error("Error tracking view for listing {}: {}", listingId, e.getMessage(), e);
            // Don't throw exception - view tracking should not break the application
        }
    }

    @Transactional(readOnly = true)
    public ListingViewStatsDto getViewStatistics(UUID listingId, LocalDateTime startDate, LocalDateTime endDate) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

        // Calculate period days
        int periodDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

        // Get total views
        long totalViews = listingViewRepository.countByListingAndViewedAtBetween(listing, startDate, endDate);

        // Get unique views
        long uniqueViews = listingViewRepository.countDistinctUserOrSessionByListingAndViewedAtBetween(
                listingId, startDate, endDate);

        // Get views by date for trend analysis
        Map<LocalDate, Long> viewsByDate = new HashMap<>();
        listingViewRepository.countViewsByDate(listingId, startDate, endDate).forEach(row -> {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
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

    @Transactional(readOnly = true)
    public ListingViewStatsDto getAggregatedViewStatisticsForSeller(User seller, LocalDateTime startDate, LocalDateTime endDate) {
        // Get all listings owned by the seller
        List<Listing> sellerListings = listingRepository.findBySeller(seller);
        
        if (sellerListings.isEmpty()) {
            return ListingViewStatsDto.builder()
                    .totalViews(0L)
                    .uniqueViews(0L)
                    .periodDays((int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1)
                    .viewsByDate(new HashMap<>())
                    .build();
        }

        // Calculate period days
        int periodDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

        // Aggregate total views across all listings
        long totalViews = sellerListings.stream()
                .mapToLong(listing -> listingViewRepository.countByListingAndViewedAtBetween(listing, startDate, endDate))
                .sum();

        // Aggregate unique views (count distinct users/sessions across all listings)
        // We need to get all views for all listings and count distinct users/sessions
        Map<String, Boolean> uniqueViewers = new HashMap<>();
        for (Listing listing : sellerListings) {
            List<ListingView> views = listingViewRepository.findByListingAndViewedAtBetween(listing, startDate, endDate);
            for (ListingView view : views) {
                String key = view.getUser() != null 
                        ? "user:" + view.getUser().getId() 
                        : "session:" + view.getSessionId();
                uniqueViewers.put(key, true);
            }
        }
        long uniqueViews = uniqueViewers.size();

        // Aggregate views by date across all listings
        Map<LocalDate, Long> viewsByDate = new HashMap<>();
        for (Listing listing : sellerListings) {
            listingViewRepository.countViewsByDate(listing.getId(), startDate, endDate).forEach(row -> {
                LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                Long count = ((Number) row[1]).longValue();
                viewsByDate.merge(date, count, Long::sum);
            });
        }

        return ListingViewStatsDto.builder()
                .totalViews(totalViews)
                .uniqueViews(uniqueViews)
                .periodDays(periodDays)
                .viewsByDate(viewsByDate)
                .build();
    }

    private String hashIpAddress(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Error hashing IP address", e);
            return "";
        }
    }
}

