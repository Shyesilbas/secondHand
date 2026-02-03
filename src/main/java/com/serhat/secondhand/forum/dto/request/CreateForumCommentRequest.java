package com.serhat.secondhand.forum.dto.request;

import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateForumCommentRequest(
        @NotBlank @Size(max = 4000) String content,
        Long parentCommentId,
        ForumAuthorVisibility authorVisibility
) {}

