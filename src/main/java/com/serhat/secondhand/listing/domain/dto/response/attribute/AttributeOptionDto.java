package com.serhat.secondhand.listing.domain.dto.response.attribute;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributeOptionDto {
    private String group;
    private String value;
    private String label;
    private int sortOrder;
}
