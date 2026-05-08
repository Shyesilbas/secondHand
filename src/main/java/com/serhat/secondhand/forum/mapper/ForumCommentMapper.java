package com.serhat.secondhand.forum.mapper;

import com.serhat.secondhand.forum.dto.ForumCommentDto;
import com.serhat.secondhand.forum.entity.ForumComment;
import com.serhat.secondhand.forum.entity.enums.ForumReactionType;
import org.springframework.stereotype.Component;

@Component
public class ForumCommentMapper {

    public ForumCommentDto toDto(ForumComment comment) {
        return toDto(comment, null);
    }

    public ForumCommentDto toDto(ForumComment comment, ForumReactionType viewerReaction) {
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
                comment.getVersion(),
                viewerReaction
        );
    }
}

