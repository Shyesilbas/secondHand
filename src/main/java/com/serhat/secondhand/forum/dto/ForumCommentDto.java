package com.serhat.secondhand.forum.dto;

import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;

import java.time.LocalDateTime;

public record ForumCommentDto(
        Long id,
        Long threadId,
        Long userId,
        ForumAuthorVisibility authorVisibility,
        String authorDisplayName,
        Long parentCommentId,
        String content,
        long totalLikes,
        long totalDislikes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long version
) {}

