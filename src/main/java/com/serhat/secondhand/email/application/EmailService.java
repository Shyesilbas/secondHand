package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService implements IEmailService {

    private final EmailRepository emailRepository;

    @Value("${app.email.sender}")
    private String defaultSenderEmail;

    @Value("${app.email.verification.subject}")
    private String verificationSubject;

    @Value("${app.email.verification.content}")
    private String verificationContentTemplate;

    @Value("${app.email.welcome.subject}")
    private String welcomeSubject;

    @Value("${app.email.welcome.content}")
    private String welcomeContentTemplate;

    @Value("${app.email.password-reset.subject}")
    private String passwordResetSubject;

    @Value("${app.email.password-reset.content}")
    private String passwordResetContentTemplate;


    @Override
    public EmailDto sendVerificationCodeEmail(User user, String verificationCode) {
        String subject = verificationSubject;
        String content = String.format(verificationContentTemplate, user.getName(), verificationCode);
        String recipientEmail = user.getEmail();
        EmailType emailType = EmailType.VERIFICATION_CODE;
        LocalDateTime now = LocalDateTime.now();

        Email email = Email.builder()
                .user(user)
                .recipientEmail(recipientEmail)
                .senderEmail(defaultSenderEmail)
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        email = emailRepository.save(email);
        log.info("Verification email saved with ID: {}", email.getId());

        return new EmailDto(
                recipientEmail,
                defaultSenderEmail,
                subject,
                content,
                emailType,
                now);
    }

    @Override
    public EmailDto sendWelcomeEmail(User user) {
        String subject = welcomeSubject;
        String content = String.format(welcomeContentTemplate, user.getName());
        String recipientEmail = user.getEmail();
        EmailType emailType = EmailType.WELCOME;
        LocalDateTime now = LocalDateTime.now();

        Email email = Email.builder()
                .user(user)
                .recipientEmail(recipientEmail)
                .senderEmail(defaultSenderEmail)
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        email = emailRepository.save(email);
        log.info("Welcome email saved with ID: {}", email.getId());

        return new EmailDto(recipientEmail, defaultSenderEmail, subject, content, emailType, now);
    }

    @Override
    public EmailDto sendPasswordResetEmail(User user, String resetToken) {
        String subject = passwordResetSubject;
        String content = String.format(passwordResetContentTemplate, user.getName(), resetToken);
        String recipientEmail = user.getEmail();
        EmailType emailType = EmailType.PASSWORD_RESET;
        LocalDateTime now = LocalDateTime.now();

        Email email = Email.builder()
                .user(user)
                .recipientEmail(recipientEmail)
                .senderEmail(defaultSenderEmail)
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        email = emailRepository.save(email);
        log.info("Password reset email saved with ID: {}", email.getId());

        return new EmailDto(recipientEmail, defaultSenderEmail, subject, content, emailType, now);
    }




    @Override
    public List<EmailDto> getUserEmails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        List<Email> emails = emailRepository.findByRecipientEmailOrderByCreatedAtDesc(currentUsername);

        return emails.stream()
                .map(email -> new EmailDto(
                        email.getRecipientEmail(),
                        defaultSenderEmail,
                        email.getSubject(),
                        email.getContent(),
                        email.getEmailType(),
                        email.getCreatedAt()
                )).toList();
    }
}