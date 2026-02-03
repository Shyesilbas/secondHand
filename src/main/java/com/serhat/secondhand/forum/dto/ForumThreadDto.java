package com.serhat.secondhand.forum.dto;

import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ForumThreadDto(
        Long id,
        String title,
        String description,
        ForumCategory category,
        ForumThreadStatus status,
        Long userId,
        ForumAuthorVisibility authorVisibility,
        String authorDisplayName,
        long totalLikes,
        long totalDislikes,
        List<String> keywords,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long version
) {}

