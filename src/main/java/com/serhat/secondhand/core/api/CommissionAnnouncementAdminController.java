package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.application.CommissionAnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements Admin", description = "One-time platform announcements to all users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class CommissionAnnouncementAdminController {

    private final CommissionAnnouncementService announcementService;

    @PostMapping("/commission")
    @Operation(summary = "Send the commission announcement",
            description = "Mails the commission and fee rules to every active user; users who already got it are skipped")
    public ResponseEntity<Map<String, Integer>> announceCommission() {
        return ResponseEntity.ok(Map.of("queued", announcementService.announceToAllUsers()));
    }
}
