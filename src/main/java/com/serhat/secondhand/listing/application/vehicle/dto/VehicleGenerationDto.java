package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;
import java.util.List;

@Data
public class VehicleGenerationDto {
    private String name;
    private Integer startYear;
    private Integer endYear;
    private String bodyType;
    private String doors;
    private String seatCount;
    private Boolean facelift;
    /** Legacy format: name + fuel only; each engine is also stored as a version with the same id. */
    private List<VehicleEngineDto> engines;
    /** Full catalog versions; use either this or {@code engines}, not both. */
    private List<VehicleVersionDto> versions;
    private List<String> trims;
}
