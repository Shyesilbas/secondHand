package com.serhat.secondhand.forum.dto.request;

import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeForumThreadStatusRequest(
        @NotNull ForumThreadStatus status
) {}

