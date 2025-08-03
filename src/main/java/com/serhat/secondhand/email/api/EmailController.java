package com.serhat.secondhand.email.api;

import com.serhat.secondhand.email.application.IEmailService;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final IEmailService emailService;
    private final IUserService userService;


    @GetMapping("/my-emails")
    public ResponseEntity<List<EmailDto>> getMyEmails() {
        return ResponseEntity.ok(emailService.getUserEmails());
    }
    // todo check the email system

    @PostMapping("/send/welcomeEmail")
    public ResponseEntity<EmailDto> sendWelcomeEmail(User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        user = userService.findByEmail(auth.getName());
       return ResponseEntity.ok( emailService.sendWelcomeEmail(user));
    }
}