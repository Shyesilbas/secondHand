package com.serhat.secondhand.listing.application.electronics.dto;

import lombok.Data;

@Data
public class ElectronicSeedModelDto {
    private String brand;
    private String type;
    private String name;
    private Boolean isLegacy;
    private Integer releaseYear;
    private java.util.List<String> aliases;
}
