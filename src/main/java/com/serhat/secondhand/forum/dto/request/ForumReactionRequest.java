package com.serhat.secondhand.forum.dto.request;

import jakarta.validation.constraints.NotNull;

public record ForumReactionRequest(
        @NotNull ForumReactionAction reaction
) {}

