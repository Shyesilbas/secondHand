package com.serhat.secondhand.email.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.email.mapper.EmailMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.serhat.secondhand.payment.dto.PaymentDto;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

    private final EmailRepository emailRepository;
    private final EmailMapper emailMapper;

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

    @Value("${app.email.paymentSuccess.subject}")
    private String paymentSuccessSubject;

    @Value("${app.email.paymentSuccess.content}")
    private String paymentSuccessContentTemplate;

    @Value("${app.email.paymentVerification.subject:SecondHand - Payment Verification}")
    private String paymentVerificationSubject;

    @Value("${app.email.paymentVerification.content:Hello %s, your payment verification code is %s. This code is valid for 15 minutes.}")
    private String paymentVerificationContentTemplate;

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

    public EmailDto sendPaymentSuccessEmail(User user, PaymentDto paymentDto, String listingTitle) {
        String subject = paymentSuccessSubject;
        String content = String.format(paymentSuccessContentTemplate, user.getName(), listingTitle, paymentDto.amount(), paymentDto.transactionType());
        return sendAndSaveEmail(user, subject, content, EmailType.NOTIFICATION);
    }

    public EmailDto sendPaymentVerificationEmail(User user, String code) {
        log.info("Sending payment verification email to user: {} with code: {}", user.getEmail(), code);
        String subject = paymentVerificationSubject;
        String content = String.format(paymentVerificationContentTemplate, user.getName(), code);
        log.info("Payment verification email subject: {}", subject);
        log.info("Payment verification email content: {}", content);
        EmailDto result = sendAndSaveEmail(user, subject, content, EmailType.PAYMENT_VERIFICATION);
        log.info("Payment verification email sent successfully with ID: {}", result.id());
        return result;
    }

    private EmailDto sendAndSaveEmail(User user, String subject, String content, EmailType emailType) {
        log.info("sendAndSaveEmail called for user: {}, emailType: {}", user.getEmail(), emailType);
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

        log.info("Email entity built: recipientEmail={}, subject={}, emailType={}", email.getRecipientEmail(), email.getSubject(), email.getEmailType());
        
        email = emailRepository.save(email);
        log.info("{} email saved with ID: {}", emailType, email.getId());

        EmailDto result = emailMapper.toDto(email);
        log.info("Email mapped to DTO: id={}, recipientEmail={}, subject={}", result.id(), result.recipientEmail(), result.subject());
        
        return result;
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
