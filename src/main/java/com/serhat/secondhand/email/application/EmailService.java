package com.serhat.secondhand.email.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.email.mapper.EmailMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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

    public List<EmailDto> getUserEmails(User user) {
        List<Email> emails = emailRepository.findByUserOrderByCreatedAtDesc(user);
        return emails.stream().map(emailMapper::toDto).toList();
    }

    public String deleteEmail(UUID emailId) {
        Email email = emailRepository.findById(emailId).orElse(null);
        if (email != null) {
            emailRepository.delete(email);
            return "Email deleted" + email.getId();
        } else {
            throw new BusinessException(
                    "Email not found",
                    HttpStatus.NOT_FOUND,
                    HttpStatus.NOT_FOUND.toString()
            );
        }
    }

    public String deleteAllEmails(User user) {
        List<Email> emails = emailRepository.findByUserOrderByCreatedAtDesc(user);
        emailRepository.deleteAll(emails);
        return "Emails deleted for user : "+user.getEmail();
    }
}
