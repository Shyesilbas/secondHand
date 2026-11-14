package com.serhat.secondhand.user;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserSettingsService;
import com.serhat.secondhand.user.domain.dto.UpdateUserSettingsRequest;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UserSettingsServiceTest {

    private final IUserService users = mock(IUserService.class);
    private final UserSettingsService service = new UserSettingsService(users);

    @Test
    void defaultsToOpenAndPersistsToggle() {
        User user = new User();
        user.setCanSendMessage(true);
        when(users.findById(5L)).thenReturn(Result.success(user));

        assertThat(service.getSettings(5L).canSendMessage()).isTrue();
        assertThat(service.updateSettings(5L, new UpdateUserSettingsRequest(false)).canSendMessage()).isFalse();

        assertThat(user.isCanSendMessage()).isFalse();
        verify(users).update(user);
    }
}
