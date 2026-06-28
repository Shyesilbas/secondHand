package com.serhat.secondhand.ai.dto;

import java.util.List;

public record UserMemoryDto(
    String userName,
    String preferredTone,
    List<String> permanentInterests,
    String userNotes,
    SecondHandProfileDto secondHandProfile
) {}
