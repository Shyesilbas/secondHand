package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.application.scheduler.EmailRetryScheduler;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

class EmailRetrySchedulerTest {

    private EmailRepository emailRepository;
    private EmailSender emailSender;
    private EmailRetryScheduler scheduler;

    @BeforeEach
    void setUp() {
        emailRepository = mock(EmailRepository.class);
        emailSender = mock(EmailSender.class);
        scheduler = new EmailRetryScheduler(emailRepository, emailSender);
    }

    @Test
    void retryFailedEmails_ShouldNotTrigger_WhenNoEmailsFound() {
        when(emailRepository.findTop50FailedEmails(EmailStatus.FAILED, 3)).thenReturn(Collections.emptyList());
        
        scheduler.retryFailedEmails();

        verify(emailSender, never()).sendEmail(any());
    }

    @Test
    void retryFailedEmails_ShouldTrigger_WhenBackoffTimeReached() {
        Email email = Email.builder()
                .id(UUID.randomUUID())
                .status(EmailStatus.FAILED)
                .retryCount(1)
                .createdAt(LocalDateTime.now().minusMinutes(15))
                .recipientEmail("test@example.com")
                .build();

        when(emailRepository.findTop50FailedEmails(EmailStatus.FAILED, 3)).thenReturn(List.of(email));

        scheduler.retryFailedEmails();

        verify(emailSender, times(1)).sendEmail(email);
    }

    @Test
    void retryFailedEmails_ShouldNotTrigger_WhenBackoffTimeNotReached() {
        Email email = Email.builder()
                .id(UUID.randomUUID())
                .status(EmailStatus.FAILED)
                .retryCount(2)
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .recipientEmail("test@example.com")
                .build();

        when(emailRepository.findTop50FailedEmails(EmailStatus.FAILED, 3)).thenReturn(List.of(email));

        scheduler.retryFailedEmails();

        verify(emailSender, never()).sendEmail(any());
    }
}
