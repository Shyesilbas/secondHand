package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.dto.UpdateUserSettingsRequest;
import com.serhat.secondhand.user.domain.dto.UserSettingsDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final IUserService userService;

    @Transactional(readOnly = true)
    public UserSettingsDto getSettings(Long userId) {
        User user = userService.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("User not found"));
        return new UserSettingsDto(user.isCanSendMessage());
    }

    @Transactional
    public UserSettingsDto updateSettings(Long userId, UpdateUserSettingsRequest request) {
        User user = userService.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("User not found"));
        user.setCanSendMessage(request.canSendMessage());
        userService.update(user);
        return new UserSettingsDto(user.isCanSendMessage());
    }
}
