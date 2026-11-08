package com.serhat.secondhand.listing.domain.dto.response.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Catalog facts of one electronic model for the listing form and detail page. */
@Data
public class ElectronicModelCatalogDto {
    private UUID id;
    private String name;
    private Integer releaseYear;
    /** claude-draft | verified; null when the model has no catalog facts. */
    private String source;
    private Map<String, Object> specs = new LinkedHashMap<>();
    private List<ColorDto> colors = new ArrayList<>();
    private List<VariantDto> variants = new ArrayList<>();

    @Data
    public static class ColorDto {
        private String name;
        private Color color;
        private String colorLabel;
    }

    @Data
    public static class VariantDto {
        private UUID id;
        private String name;
        private Integer ram;
        private Integer storage;
        private StorageType storageType;
        private Processor processor;
        private String chipset;
        private String gpuModel;
        private Map<String, Object> specs = new LinkedHashMap<>();
        private String source;
    }
}
