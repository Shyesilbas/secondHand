package com.serhat.secondhand.forum.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateForumThreadRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 4000) String description
) {}

