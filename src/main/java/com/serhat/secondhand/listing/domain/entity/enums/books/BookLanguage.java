package com.serhat.secondhand.listing.domain.entity.enums.books;

import lombok.Getter;

@Getter
public enum BookLanguage {
    TURKISH("Turkish"),
    ENGLISH("English"),
    GERMAN("German"),
    FRENCH("French"),
    SPANISH("Spanish"),
    OTHER("Other");

    private final String label;

    BookLanguage(String label) {
        this.label = label;
    }
}


