package com.serhat.secondhand.listing.domain.entity.enums.books;

import lombok.Getter;

@Getter
public enum BookFormat {
    HARDCOVER("Hardcover"),
    PAPERBACK("Paperback"),
    EBOOK("eBook");

    private final String label;

    BookFormat(String label) {
        this.label = label;
    }
}


