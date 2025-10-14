package com.serhat.secondhand.listing.domain.entity.enums.books;

import lombok.Getter;

@Getter
public enum BookCondition {
    NEW("New"),
    LIKE_NEW("Like New"),
    GOOD("Good"),
    FAIR("Fair"),
    POOR("Poor");

    private final String label;

    BookCondition(String label) {
        this.label = label;
    }
}


