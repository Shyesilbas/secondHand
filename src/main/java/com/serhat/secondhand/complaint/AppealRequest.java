package com.serhat.secondhand.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppealRequest(
        @NotBlank
        @Size(max = 1000)
        String reason
) {
}
