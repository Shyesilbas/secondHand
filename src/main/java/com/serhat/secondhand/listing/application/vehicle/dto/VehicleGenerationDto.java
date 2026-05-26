package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;
import java.util.List;

@Data
public class VehicleGenerationDto {
    private String name;
    private List<VehicleEngineDto> engines;
    private List<String> trims;
}
