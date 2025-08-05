package com.serhat.secondhand.email.api;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
