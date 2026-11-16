package com.serhat.secondhand.user.domain.dto;

import jakarta.validation.constraints.*;

import com.serhat.secondhand.user.domain.entity.enums.AddressType;
import lombok.Data;

@Data
public class AddressDto {
    private Long id;
    @NotBlank @Size(max = 255)
    private String addressLine;
    @NotBlank @Size(max = 255)
    private String city;
    @Size(max = 60)
    private String cityKey;
    @Size(max = 60)
    private String districtKey;
    @Size(max = 60)
    private String neighborhoodKey;
    @NotBlank @Size(max = 255)
    private String state;
    @NotBlank @Size(max = 20)
    private String postalCode;
    @NotBlank @Size(max = 255)
    private String country;
    @NotNull
    private AddressType addressType;
    private boolean mainAddress;
}
