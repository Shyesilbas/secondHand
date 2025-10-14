package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum Currency {
    USD("United States Dollar", "$"),
    TRY("Turkish Lira", "₺"),
    EUR("Euro", "€");

    private final String label;
    private final String symbol;

    Currency(String label, String symbol) {
        this.label = label;
        this.symbol = symbol;
    }
}
