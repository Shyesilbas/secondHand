package com.serhat.secondhand.forum.dto.request;

import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateForumThreadRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 4000) String description,
        @NotNull ForumCategory category,
        ForumAuthorVisibility authorVisibility
) {}

