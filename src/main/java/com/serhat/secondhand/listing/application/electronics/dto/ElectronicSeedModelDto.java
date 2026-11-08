package com.serhat.secondhand.listing.application.electronics.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/** One model in data/electronics/&lt;type&gt;/&lt;brand&gt;.json. Catalog facts are optional; JSON is the truth on reruns. */
@Data
public class ElectronicSeedModelDto {
    private String brand;
    private String type;
    private String name;
    private Boolean isLegacy;
    private Integer releaseYear;
    private List<String> aliases;
    /** Keys from ElectronicCatalogSpecs. */
    private Map<String, Object> specs;
    private List<Color> colors;
    private List<Variant> variants;
    /** claude-draft | verified; required when specs, colors or variants are given. */
    private String source;

    @Data
    public static class Color {
        private String name;
        /** Color enum name used by filters. */
        private String color;
    }

    @Data
    public static class Variant {
        private String name;
        private Integer ram;
        private Integer storage;
        private String storageType;
        private String processor;
        private String chipset;
        private String gpuModel;
        private Map<String, Object> specs;
        private String source;
    }
}
