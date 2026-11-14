package com.serhat.secondhand.user.domain.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserSettingsRequest(@NotNull Boolean canSendMessage) {
}
