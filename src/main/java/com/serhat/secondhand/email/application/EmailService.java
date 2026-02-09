package com.serhat.secondhand.email.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.email.mapper.EmailMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

    private final EmailRepository emailRepository;
    private final EmailMapper emailMapper;
    private final EmailConfig emailConfig;


    public EmailDto sendEmail(User user, String subject, String content, EmailType emailType) {
        log.info("Sending email to user: {}, emailType: {}", user.getEmail(), emailType);
        LocalDateTime now = LocalDateTime.now();
        Email email = Email.builder()
                .user(user)
                .recipientEmail(user.getEmail())
                .senderEmail(emailConfig.getSender())
                .subject(subject)
                .content(content)
                .emailType(emailType)
                .createdAt(now)
                .build();

        email = emailRepository.save(email);
        log.info("{} email saved with ID: {}", emailType, email.getId());

        return emailMapper.toDto(email);
    }

    public Page<EmailDto> getUserEmails(Long userId, Pageable pageable) {
        log.info("Fetching paginated emails for userId: {}", userId);

        Page<Email> emailsPage = emailRepository.findByUserId(userId, pageable);

        if (pageable.getPageNumber() == 0 && !emailsPage.isEmpty()) {
            emailRepository.markAllRead(emailsPage.getContent().get(0).getUser(), LocalDateTime.now());
        }

        return emailsPage.map(emailMapper::toDto);
    }

    public Page<EmailDto> getEmailsByType(Long userId,Pageable pageable, EmailType emailType) {
        log.info("Fetching emails by type {} for userId: {}", emailType, userId);

        Page<Email> emailsPage = emailRepository.findByUserIdAndEmailType(userId, pageable, emailType);
        return emailsPage.map(emailMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return emailRepository.countByUserIdAndReadAtIsNull(userId);
    }

    public Result<String> deleteEmail(UUID emailId) {
        Email email = emailRepository.findById(emailId).orElse(null);
        if (email != null) {
            emailRepository.delete(email);
            return Result.success("Email deleted" + email.getId());
        } else {
            return Result.error("Email not found", "EMAIL_NOT_FOUND");
        }
    }

    public String deleteAllEmails(Long userId) {
        emailRepository.deleteAllByUserId(userId);
        return "Emails deleted for userId: " + userId;
    }
}
