package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

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

    @Value("${app.email.phoneUpdate.subject}")
    private String phoneUpdateSubject;

    @Value("${app.email.phoneUpdate.content}")
    private String phoneUpdateContentTemplate;

    public EmailDto sendVerificationCodeEmail(User user, String verificationCode) {
        String subject = verificationSubject;
        String content = String.format(verificationContentTemplate, user.getName(), verificationCode);
        return sendAndSaveEmail(user, subject, content, EmailType.VERIFICATION_CODE);
    }

    public EmailDto sendPhoneNumberUpdatedEmail(User user) {
        String subject = phoneUpdateSubject;
        String content = String.format(phoneUpdateContentTemplate, user.getName());
        return sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
    }

    public EmailDto sendWelcomeEmail(User user) {
        String subject = welcomeSubject;
        String content = String.format(welcomeContentTemplate, user.getName());
        return sendAndSaveEmail(user, subject, content, EmailType.WELCOME);
    }

    private EmailDto sendAndSaveEmail(User user, String subject, String content, EmailType emailType) {
        LocalDateTime now = LocalDateTime.now();
        Email email = Email.builder()
                .user(user)
                .recipientEmail(user.getEmail())
                .senderEmail(defaultSenderEmail)
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        email = emailRepository.save(email);
        log.info("{} email saved with ID: {}", emailType, email.getId());

        return new EmailDto(
                user.getEmail(),
                defaultSenderEmail,
                subject,
                content,
                emailType,
                now);
    }

    public List<EmailDto> getUserEmails(User user) {
        List<Email> emails = emailRepository.findByUserOrderByCreatedAtDesc(user);

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
