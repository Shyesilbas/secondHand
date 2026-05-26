package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;
import java.util.List;

@Data
public class VehicleBrandCatalogDto {
    private String brand;
    private String displayName;
    private List<VehicleBrandTypeFileDto> supportedTypes;
}
