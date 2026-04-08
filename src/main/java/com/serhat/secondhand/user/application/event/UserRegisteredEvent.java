package com.serhat.secondhand.user.application.event;

import com.serhat.secondhand.user.domain.entity.User;

public record UserRegisteredEvent(User user) {
}
