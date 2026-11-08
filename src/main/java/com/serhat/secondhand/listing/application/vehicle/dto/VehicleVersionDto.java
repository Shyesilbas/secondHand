package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** One catalog version of a generation in the seed file ({@code generations[].versions[]}). */
@Data
public class VehicleVersionDto {
    private String name;
    private String fuelType;
    private Integer engineCapacity;
    private Integer horsePower;
    private Integer powerKw;
    private Integer torqueNm;
    private String gearbox;
    private Integer gearCount;
    private String drivetrain;
    private Integer startYear;
    private Integer endYear;
    private BigDecimal listPriceTry;
    /** {@code claude-draft} (default) or {@code verified}. */
    private String source;
    /** CATALOG-level attribute values (keys from data/attributes/vehicle.json). */
    private Map<String, Object> specs;
    /** Names of the generation's trims this version is sold with; empty = every trim. */
    private List<String> trims;
}
