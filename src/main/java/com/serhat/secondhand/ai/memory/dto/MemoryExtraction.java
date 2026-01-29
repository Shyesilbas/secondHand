package com.serhat.secondhand.ai.memory.dto;

import java.util.List;

public record MemoryExtraction(
        String name,
        String tone,
        List<String> interests,
        String notes,
        String secondHandProfileJson
) {
}
