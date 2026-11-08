package com.serhat.secondhand.listing.application.electronics.dto;

import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import lombok.Data;

import java.util.Map;

/** One entry of data/electronics/types.json: label, picker order and a rule for every spec field. */
@Data
public class ElectronicTypeDefinitionDto {
    private String type;
    private String label;
    private Integer sortOrder;
    private Map<String, SpecFieldRule> fields;
}
