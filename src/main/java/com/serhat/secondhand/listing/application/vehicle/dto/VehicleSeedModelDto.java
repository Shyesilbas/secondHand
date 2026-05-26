package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;
import java.util.List;

@Data
public class VehicleSeedModelDto {
    private String brand;
    private String type;
    private String name;
    private List<String> supportedBodyTypes;
    private List<VehicleGenerationDto> generations;
}
