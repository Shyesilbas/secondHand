package com.serhat.secondhand.core.audit.api;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit Logs", description = "Audit log management operations")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/user/{userEmail}")
    @Operation(summary = "Get audit logs by user email", description = "Retrieve paginated audit logs for a specific user")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByUserEmail(
            @PathVariable String userEmail,
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("Fetching audit logs for user: {} with pagination", userEmail);
        Page<AuditLog> auditLogs = auditLogService.getUserAuditLogs(userEmail, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/user/id/{userId}")
    @Operation(summary = "Get audit logs by user ID", description = "Retrieve paginated audit logs for a specific user ID")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching audit logs for user ID: {} with pagination", userId);
        Page<AuditLog> auditLogs = auditLogService.getUserAuditLogs(userId, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/event-type/{eventType}")
    @Operation(summary = "Get audit logs by event type", description = "Retrieve audit logs filtered by event type")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByEventType(
            @PathVariable AuditLog.AuditEventType eventType,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching audit logs for event type: {}", eventType);
        Page<AuditLog> auditLogs = auditLogService.getAuditLogsByEventType(eventType, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get audit logs by date range", description = "Retrieve audit logs within a specific date range")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching audit logs from {} to {}", startDate, endDate);
        Page<AuditLog> auditLogs = auditLogService.getAuditLogsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/failed-attempts/user/{userEmail}")
    @Operation(summary = "Count failed login attempts by user", description = "Count failed login attempts for a user since a specific time")
    public ResponseEntity<Long> countFailedLoginAttemptsByUser(
            @PathVariable String userEmail,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        log.info("Counting failed login attempts for user: {} since {}", userEmail, since);
        Long count = auditLogService.countFailedLoginAttemptsByUser(userEmail, since);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/failed-attempts/ip/{ipAddress}")
    @Operation(summary = "Count failed login attempts by IP", description = "Count failed login attempts from an IP since a specific time")
    public ResponseEntity<Long> countFailedLoginAttemptsByIp(
            @PathVariable String ipAddress,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        log.info("Counting failed login attempts from IP: {} since {}", ipAddress, since);
        Long count = auditLogService.countFailedLoginAttemptsByIp(ipAddress, since);
        return ResponseEntity.ok(count);
    }
}
