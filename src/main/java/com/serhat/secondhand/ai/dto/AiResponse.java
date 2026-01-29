package com.serhat.secondhand.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiResponse(
        boolean success,
        String answer,
        String error,
        LocalDateTime timestamp,
        String model
) {
    public static AiResponse success(String answer, String model) {
        return new AiResponse(true, answer, null, LocalDateTime.now(), model);
    }

    public static AiResponse error(String error) {
        return new AiResponse(false, null, error, LocalDateTime.now(), null);
    }
}
