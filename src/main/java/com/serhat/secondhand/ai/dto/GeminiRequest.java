package com.serhat.secondhand.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiRequest(
        List<Content> contents,
        GenerationConfig generationConfig,
        Content systemInstruction
) {
    public GeminiRequest(List<Content> contents) {
        this(contents, null, null);
    }

    public GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {
        this(contents, generationConfig, null);
    }

    public record Content(List<Part> parts) {}
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Part(String text, InlineData inlineData) {
        public Part(String text) {
            this(text, null);
        }

        public static Part image(String mimeType, String base64Data) {
            return new Part(null, new InlineData(mimeType, base64Data));
        }
    }

    /** Inline media part; {@code data} is base64 without a data-URL prefix. */
    public record InlineData(String mimeType, String data) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GenerationConfig(String responseMimeType, Map<String, Object> responseSchema) {
        public GenerationConfig(String responseMimeType) {
            this(responseMimeType, null);
        }
    }
}
