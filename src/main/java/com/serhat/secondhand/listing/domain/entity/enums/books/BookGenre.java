package com.serhat.secondhand.listing.domain.entity.enums.books;

import lombok.Getter;

@Getter
public enum BookGenre {
    FICTION("Fiction"),
    NON_FICTION("Non Fiction"),
    SCIENCE("Science"),
    FANTASY("Fantasy"),
    HISTORY("History"),
    BIOGRAPHY("Biography"),
    CHILDREN("Children"),
    OTHER("Other");

    private final String label;

    BookGenre(String label) {
        this.label = label;
    }
}


