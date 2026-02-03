package com.serhat.secondhand.forum.mapper;

import com.serhat.secondhand.forum.dto.ForumCommentDto;
import com.serhat.secondhand.forum.entity.ForumComment;
import org.springframework.stereotype.Component;

@Component
public class ForumCommentMapper {

    public ForumCommentDto toDto(ForumComment comment) {
        if (comment == null) return null;
        return new ForumCommentDto(
                comment.getId(),
                comment.getThreadId(),
                comment.getUserId(),
                comment.getAuthorVisibility(),
                comment.getAuthorDisplayName(),
                comment.getParentCommentId(),
                comment.getContent(),
                comment.getTotalLikes(),
                comment.getTotalDislikes(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getVersion()
        );
    }
}

