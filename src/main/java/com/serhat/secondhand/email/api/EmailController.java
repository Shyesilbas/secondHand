package com.serhat.secondhand.email.api;

import com.serhat.secondhand.email.application.IEmailService;
import com.serhat.secondhand.email.dto.EmailDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Management", description = "Email operations and history")
public class EmailController {

    private final IEmailService emailService;

    @Operation(summary = "Get current user's email history")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email history retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/my-emails")
    public ResponseEntity<List<EmailDto>> getMyEmails(Authentication authentication) {
        log.info("Getting email history for user: {}", authentication.getName());
        List<EmailDto> emails = emailService.getUserEmails(authentication);
        return ResponseEntity.ok(emails);
    }

    @Operation(summary = "Send welcome email to current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Welcome email sent successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Email sending failed")
    })
    @PostMapping("/send/welcome")
    public ResponseEntity<EmailDto> sendWelcomeEmail(Authentication authentication) {
        log.info("Sending welcome email for user: {}", authentication.getName());
        EmailDto emailDto = emailService.sendWelcomeEmail(authentication);
        return ResponseEntity.ok(emailDto);
    }
}