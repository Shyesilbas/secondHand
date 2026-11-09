package com.serhat.secondhand.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiRequest(
        List<Content> contents,
        GenerationConfig generationConfig
) {
    public GeminiRequest(List<Content> contents) {
        this(contents, null);
    }

    public record Content(List<Part> parts) {}
    public record Part(String text) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GenerationConfig(String responseMimeType) {}
}