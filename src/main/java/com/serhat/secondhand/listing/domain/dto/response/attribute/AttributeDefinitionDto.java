package com.serhat.secondhand.listing.domain.dto.response.attribute;

import com.serhat.secondhand.listing.domain.entity.attribute.AttributeDataType;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Cached, read-only view of a listing attribute definition (drives validation and the form). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributeDefinitionDto {
    private String key;
    private String scopeKey;
    private String label;
    private String unit;
    private AttributeDataType dataType;
    private AttributeLevel level;
    private BigDecimal min;
    private BigDecimal max;
    private boolean required;
    private boolean filterable;
    private int sortOrder;
    private List<AttributeOptionDto> options = new ArrayList<>();
}
