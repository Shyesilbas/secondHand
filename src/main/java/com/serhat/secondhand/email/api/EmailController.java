package com.serhat.secondhand.email.api;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Management", description = "Email operations and history")
public class EmailController {

    private final EmailService emailService;
    private final UserService userService;


    @GetMapping("/my-emails")
    public ResponseEntity<List<EmailDto>> getMyEmails(Authentication authentication) {
        log.info("Getting email history for user: {}", authentication.getName());
        User user = userService.getAuthenticatedUser(authentication);
        List<EmailDto> emails = emailService.getUserEmails(user);
        return ResponseEntity.ok(emails);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(Map.of("count", emailService.getUnreadCount(user)));
    }

    @DeleteMapping("/{emailId}")
    public ResponseEntity<?> delete(@PathVariable UUID emailId) {
        var result = emailService.deleteEmail(emailId);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAll(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(emailService.deleteAllEmails(user));
    }
}
