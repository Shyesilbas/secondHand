package com.serhat.secondhand.email.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Management", description = "Email operations and history")
public class EmailController {

    private final EmailService emailService;


    @GetMapping("/my-emails")
    public ResponseEntity<Page<EmailDto>> getMyEmails(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("Getting email history for userId: {}", currentUser.getId());
        Page<EmailDto> emails = emailService.getUserEmails(currentUser.getId(), pageable);
        return ResponseEntity.ok(emails);
    }

    @GetMapping("/my-emails/{emailType}")
    public ResponseEntity<Page<EmailDto>> getMyEmailsByType(
            @PathVariable EmailType emailType,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable)
    {
        Page<EmailDto> emails = emailService.getEmailsByType(currentUser.getId(), pageable,emailType);
        return ResponseEntity.ok(emails);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<EmailDto> markEmailAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        log.info("Marking email {} as read for user: {}", id, currentUser.getEmail());
        EmailDto updatedEmail = emailService.markAsRead(id, currentUser.getEmail());
        return ResponseEntity.ok(updatedEmail);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = emailService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @DeleteMapping("/{emailId}")
    public ResponseEntity<?> delete(@PathVariable UUID emailId) {
        return ResultResponses.ok(emailService.deleteEmail(emailId));
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAll(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(emailService.deleteAllEmails(currentUser.getId()));
    }
}
