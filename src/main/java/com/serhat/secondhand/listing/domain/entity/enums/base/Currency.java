package com.serhat.secondhand.listing.domain.entity.enums.base;

import lombok.Getter;

@Getter
public enum Currency {
    USD("ABD Doları", "$"),
    TRY("Türk Lirası", "₺"),
    EUR("Euro", "€");

    private final String label;
    private final String symbol;

    Currency(String label, String symbol) {
        this.label = label;
        this.symbol = symbol;
    }
}
