package com.serhat.secondhand.forum.dto;

import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;

import com.serhat.secondhand.forum.entity.enums.ForumReactionType;
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
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt,
        Long version,
        ForumReactionType viewerReaction
) {}

