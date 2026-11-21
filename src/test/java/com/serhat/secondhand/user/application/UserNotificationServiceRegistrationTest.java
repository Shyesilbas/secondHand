package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.VerificationCodeEmailEvent;
import com.serhat.secondhand.email.application.event.impl.WelcomeEmailEvent;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.application.event.UserRegisteredEvent;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class UserNotificationServiceRegistrationTest {

    private final EmailEventPublisher emailEventPublisher = mock(EmailEventPublisher.class);
    private final UserNotificationService service = new UserNotificationService(
            emailEventPublisher, new EmailConfig(), mock(NotificationEventPublisher.class),
            mock(NotificationTemplateCatalog.class));

    @Test
    void registrationSendsTheWelcomeEmailButNoVerificationCode() {
        User user = User.builder().id(7L).name("Test").email("new@test.local").build();

        service.onUserRegistered(new UserRegisteredEvent(user));

        verify(emailEventPublisher).publish(isA(WelcomeEmailEvent.class));
        verify(emailEventPublisher, never()).publish(isA(VerificationCodeEmailEvent.class));
    }
}
