package com.serhat.secondhand.user.domain.dto;

import com.serhat.secondhand.user.domain.entity.enums.AddressType;
import lombok.Data;

@Data
public class AddressDto {
    private Long id;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private AddressType addressType;
    private boolean mainAddress;
}
