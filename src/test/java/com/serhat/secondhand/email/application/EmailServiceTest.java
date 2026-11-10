package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.email.mapper.EmailMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private EmailRepository emailRepository;

    @Mock
    private EmailMapper emailMapper;

    @InjectMocks
    private EmailService emailService;

    @Test
    void markAllAsRead_callsRepositoryAndReturnsCount() {
        Long userId = 42L;
        when(emailRepository.markAllRead(eq(userId), any(LocalDateTime.class))).thenReturn(5);

        int count = emailService.markAllAsRead(userId);

        assertEquals(5, count);
        verify(emailRepository).markAllRead(eq(userId), any(LocalDateTime.class));
    }
}

