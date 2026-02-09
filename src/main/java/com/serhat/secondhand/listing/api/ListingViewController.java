package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.listing.application.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.request.TrackViewRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Listing View Tracking", description = "Track and retrieve listing view statistics")
public class ListingViewController {

    private final ListingViewService listingViewService;
    private final AuditLogService auditLogService;

    @PostMapping("/{id}/view")
    @Operation(summary = "Track a listing view", description = "Public endpoint to track when a listing is viewed. Supports both authenticated and anonymous users.")
    public ResponseEntity<Void> trackView(
            @PathVariable UUID id,
            @RequestBody(required = false) TrackViewRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {

        String sessionId = request != null ? request.getSessionId() : null;
        String userAgent = request != null ? request.getUserAgent() : (httpRequest.getHeader("User-Agent"));
        String ipAddress = auditLogService.getClientIpAddress(httpRequest);

        Long userId = (currentUser != null) ? currentUser.getId() : null;

        listingViewService.trackView(id, userId, sessionId, ipAddress, userAgent);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/view-stats")
    @Operation(summary = "Get listing view statistics", description = "Get view statistics for a listing. Only accessible by the listing owner.")
    public ResponseEntity<ListingViewStatsDto> getViewStatistics(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal User currentUser) {

        if (endDate == null) endDate = LocalDateTime.now();
        if (startDate == null) startDate = endDate.minusDays(7);

        ListingViewStatsDto stats = listingViewService.getViewStatistics(id, startDate, endDate);
        return ResponseEntity.ok(stats);
    }
}