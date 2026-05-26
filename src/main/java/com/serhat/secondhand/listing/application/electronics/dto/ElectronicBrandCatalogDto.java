package com.serhat.secondhand.listing.application.electronics.dto;

import lombok.Data;
import java.util.List;

@Data
public class ElectronicBrandCatalogDto {
    private String brand;
    private String displayName;
    private List<ElectronicBrandTypeFileDto> supportedTypes;
}
