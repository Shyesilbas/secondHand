package com.serhat.secondhand.listing.application.attribute;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** {@code data/attributes/<type>.json}: every attribute definition of one listing type. */
@Data
public class ListingAttributeSeedFileDto {
    private String listingType;
    private List<Definition> definitions;

    @Data
    public static class Definition {
        private String scope;
        private String key;
        private String label;
        private String unit;
        private String dataType;
        private String level;
        private BigDecimal min;
        private BigDecimal max;
        private boolean required;
        private boolean filterable;
        private String source;
        /** Allowed values (ENUM, MULTI_ENUM, values of ENUM_MAP). */
        private List<Option> options;
        /** Allowed keys of an ENUM_MAP (e.g. car body parts). */
        private List<Option> keys;
    }

    @Data
    public static class Option {
        private String value;
        private String label;
    }
}
