package com.serhat.secondhand.user.domain.entity.enums;

import lombok.Getter;

@Getter
public enum Gender {
    MALE("Male"),
    FEMALE("Female"),
    PREFER_NOT_TO_SAY("Prefer not to say");

    private final String label;

    Gender(String label) {
        this.label = label;
    }
}
