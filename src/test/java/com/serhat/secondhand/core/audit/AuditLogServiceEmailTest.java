package com.serhat.secondhand.core.audit;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.mapper.AuditLogMapper;
import com.serhat.secondhand.core.audit.repository.AuditLogRepository;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.security.ClientIpResolver;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;

/** Successful logins and logouts are visible on the security page only; no mail is sent for them. */
@ExtendWith(MockitoExtension.class)
class AuditLogServiceEmailTest {

    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AuditLogMapper auditLogMapper;
    @Mock private UserRepository userRepository;
    @Mock private EmailEventPublisher emailEventPublisher;
    @Mock private ClientIpResolver clientIpResolver;

    private AuditLogService service;

    @BeforeEach
    void setUp() {
        service = new AuditLogService(auditLogRepository, auditLogMapper, userRepository, emailEventPublisher, clientIpResolver);
        lenient().when(userRepository.findByEmail("a@b.c")).thenReturn(Optional.of(User.builder().email("a@b.c").name("Ada").build()));
    }

    @Test
    void successfulLogin_isAuditedWithoutMail() {
        service.logLogin("a@b.c", "1.2.3.4", "ua", true, null);

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(emailEventPublisher, never()).publish(any());
    }

    @Test
    void googleLogin_isAuditedWithoutMail() {
        service.logLoginViaGoogle("a@b.c", 1L, "1.2.3.4", "ua");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(emailEventPublisher, never()).publish(any());
    }

    @Test
    void logout_isAuditedWithoutMail() {
        service.logLogout("a@b.c", 1L, "1.2.3.4", "ua");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(emailEventPublisher, never()).publish(any());
    }

    @Test
    void failedLogin_stillAlertsTheOwner() {
        service.logLogin("a@b.c", "1.2.3.4", "ua", false, "bad credentials");

        verify(emailEventPublisher).publish(any());
    }
}
