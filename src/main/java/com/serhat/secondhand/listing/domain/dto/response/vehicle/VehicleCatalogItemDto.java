package com.serhat.secondhand.listing.domain.dto.response.vehicle;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * One node of the vehicle catalog (type, brand, model, generation, version or trim). Only the fields of
 * that level are set; generations carry the body facts and versions the specs a form fills automatically.
 */
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleCatalogItemDto {
    private UUID id;
    private String name;
    private String label;

    // model
    private List<BodyType> bodyTypes;

    // generation + version
    private Integer startYear;
    private Integer endYear;

    // generation
    private BodyType bodyType;
    private Doors doors;
    private SeatCount seatCount;
    private Boolean facelift;

    // version
    private FuelType fuelType;
    private Integer engineCapacity;
    private Integer horsePower;
    private Integer powerKw;
    private Integer torqueNm;
    private GearType gearbox;
    private Integer gearCount;
    private Drivetrain drivetrain;
    private BigDecimal listPriceTry;
    private String source;
    private Map<String, Object> specs;
    /** Trims this version is sold with; empty = every trim of the generation. */
    private List<UUID> trimIds;
}
