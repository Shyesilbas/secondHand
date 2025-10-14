package com.serhat.secondhand.listing.domain.entity.enums.sports;

import lombok.Getter;

@Getter
public enum SportCondition {
    NEW("New"),
    LIKE_NEW("Like New"),
    GOOD("Good"),
    FAIR("Fair"),
    WORN("Worn");

    private final String label;

    SportCondition(String label) {
        this.label = label;
    }
}


