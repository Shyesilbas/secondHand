package com.serhat.secondhand.listing.application.vehicle.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/** One entry of data/vehicles/types.json. */
@Data
public class VehicleTypeDefinitionDto {
    private String type;
    private String label;
    private Integer sortOrder;
    private List<String> bodyTypes;
    /** Spec field name -> REQUIRED | OPTIONAL | HIDDEN. */
    private Map<String, String> fields;
}
