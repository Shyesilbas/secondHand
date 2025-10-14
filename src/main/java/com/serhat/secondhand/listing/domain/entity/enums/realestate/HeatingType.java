package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import lombok.Getter;

@Getter
public enum HeatingType {

    NONE("None"),
    STOVE("Stove"),
    NATURAL_GAS("Natural Gas"),
    CENTRAL_SYSTEM("Central System"),
    COMBI_BOILER("Combi Boiler"),
    AIR_CONDITIONER("Air Conditioner"),
    GEOTHERMAL("Geothermal"),
    FLOOR_HEATING("Floor Heating"),
    OTHER("Other");

    private final String label;

    HeatingType(String label) {
        this.label = label;
    }
}
