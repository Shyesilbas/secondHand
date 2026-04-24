package com.serhat.secondhand.user.api;

import com.serhat.secondhand.user.application.UserBadgeService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Badges", description = "Aggregated badge counts for efficient frontend polling")
public class UserBadgesController {

    private final UserBadgeService userBadgeService;

    @GetMapping("/badges")
    @Operation(
        summary = "Get all user badges",
        description = "Aggregated endpoint returning notification count, chat unread count, and pending order status in a single call"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Badges retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getUserBadges(@AuthenticationPrincipal User currentUser) {
        log.debug("Fetching aggregated badges for user: {}", currentUser.getEmail());
        return ResponseEntity.ok(userBadgeService.getUserBadges(currentUser.getId()));
    }
}
