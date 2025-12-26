package com.serhat.secondhand.dashboard.api;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Analytics dashboard operations")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/seller")
    @Operation(summary = "Get seller dashboard", description = "Retrieve analytics dashboard for seller")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dashboard retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<SellerDashboardDto> getSellerDashboard(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if not specified
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }
        
        log.info("API request for seller dashboard from {} to {} for user: {}", startDate, endDate, currentUser.getEmail());
        SellerDashboardDto dashboard = dashboardService.getSellerDashboard(currentUser, startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/buyer")
    @Operation(summary = "Get buyer dashboard", description = "Retrieve analytics dashboard for buyer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dashboard retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<BuyerDashboardDto> getBuyerDashboard(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if not specified
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }
        
        log.info("API request for buyer dashboard from {} to {} for user: {}", startDate, endDate, currentUser.getEmail());
        BuyerDashboardDto dashboard = dashboardService.getBuyerDashboard(currentUser, startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }
}

