package com.serhat.secondhand.user.domain.dto;

import java.time.LocalDateTime;

public record BlockedUserDto(Long id, String name, String surname, String profileImageUrl, LocalDateTime blockedAt) {
}
