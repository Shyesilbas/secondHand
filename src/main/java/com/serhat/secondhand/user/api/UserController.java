package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.verification.VerificationService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "User profile and verification operations")
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final VerificationService verificationService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserDto response = userService.getCurrentUserProfile(authentication);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/verification/send")
    public ResponseEntity<Void> sendVerificationCode(Authentication authentication) {
        log.info("Sending verification code for user: {}", authentication.getName());
        verificationService.sendAccountVerificationCode(authentication);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/verification/verify")
    public ResponseEntity<Void> verifyUser(
            @Valid @RequestBody VerificationRequest request,
            Authentication authentication) {
        log.info("Verifying user account for: {}", authentication.getName());
        verificationService.verifyUser(request, authentication);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto response = userService.getById(id);
        return ResponseEntity.ok(response);

    }


    @PutMapping("/email")
    public ResponseEntity<String> updateEmail(
            @Valid @RequestBody UpdateEmailRequest request,
            Authentication authentication) {
        log.info("Updating email for user: {}", authentication.getName());
        String response = userService.updateEmail(request, authentication);
        return ResponseEntity.ok(response);
    }


    @PutMapping("/phone")
    public ResponseEntity<String> updatePhone(
            @Valid @RequestBody UpdatePhoneRequest request,
            Authentication authentication) {
        log.info("Updating phone for user: {}", authentication.getName());
        String response = userService.updatePhone(request, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Searching users with query: {} and limit: {}", query, limit);
        List<UserDto> response = userService.searchUsers(query, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get user audit logs", description = "Retrieve paginated audit logs for the authenticated user")
    public ResponseEntity<Page<AuditLog>> getMyAuditLogs(
            Authentication authentication,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        log.info("Getting audit logs for user: {} with page: {}, size: {}", authentication.getName(), pageable.getPageNumber(), pageable.getPageSize());
        Page<AuditLog> auditLogs = auditLogService.getUserAuditLogs(authentication.getName(), pageable);
        return ResponseEntity.ok(auditLogs);
    }
}