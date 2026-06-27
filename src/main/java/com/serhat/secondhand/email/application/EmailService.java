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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

    private final EmailRepository emailRepository;
    private final EmailMapper emailMapper;
    private final EmailConfig emailConfig;
    private final org.thymeleaf.TemplateEngine templateEngine;

    public EmailDto sendTemplateEmail(User user, String subject, String templateName, org.thymeleaf.context.Context context, EmailType emailType) {
        String content = templateEngine.process("email/" + templateName, context);
        return sendEmail(user, subject, content, emailType);
    }


    @CacheEvict(value = "userBadges", key = "#user.id")
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

    public Page<EmailDto> getUserEmails(Long userId, Collection<EmailType> emailTypes, Pageable pageable) {
        log.info("Fetching paginated emails for userId: {}, types: {}", userId, emailTypes);
        Page<Email> emailsPage;
        if (emailTypes == null || emailTypes.isEmpty()) {
            emailsPage = emailRepository.findByUserId(userId, pageable);
        } else {
            emailsPage = emailRepository.findByUserIdAndEmailTypeIn(userId, emailTypes, pageable);
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

    @CacheEvict(value = "userBadges", key = "#userId")
    public Result<String> deleteEmail(UUID emailId, Long userId) {
        int affected = emailRepository.softDeleteByIdAndUserId(emailId, userId, LocalDateTime.now());
        if (affected > 0) {
            return Result.success("Email deleted " + emailId);
        }
        return Result.error("Email not found or unauthorized", "EMAIL_NOT_FOUND");
    }

    @CacheEvict(value = "userBadges", key = "#userId")
    public String deleteAllEmails(Long userId) {
        emailRepository.softDeleteAllByUserId(userId, LocalDateTime.now());
        return "Emails deleted for userId: " + userId;
    }

    @CacheEvict(value = "userBadges", key = "#userId")
    public EmailDto markAsRead(UUID emailId, Long userId, String userEmail) {
        Email email = emailRepository.findByIdAndRecipientEmail(emailId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Email not found or unauthorized"));
                
        if (email.getReadAt() == null) {
            email.setReadAt(LocalDateTime.now());
            email = emailRepository.save(email);
            log.info("Email {} marked as read", emailId);
        }
        return emailMapper.toDto(email);
    }
    
    @Transactional(readOnly = true)
    public Result<Page<EmailDto>> getEmailsByUser(String email, Pageable pageable) {
        Page<Email> emailsPage = emailRepository.findByRecipientEmail(email, pageable);
        return Result.success(emailsPage.map(emailMapper::toDto));
    }
}
