package com.serhat.secondhand.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UserMemoryDto(
    @Size(max = 60, message = "User name must be at most 60 characters")
    String userName,
    @Size(max = 30, message = "Preferred tone must be at most 30 characters")
    String preferredTone,
    @Size(max = 20, message = "Permanent interests must contain at most 20 items")
    List<@Size(max = 60, message = "Each interest must be at most 60 characters") String> permanentInterests,
    @Size(max = 500, message = "User notes must be at most 500 characters")
    String userNotes,
    @Valid
    SecondHandProfileDto secondHandProfile
) {}
