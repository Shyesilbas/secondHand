package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

/** How a vehicle type treats one listing spec field; set per type in data/vehicles/types.json. */
public enum VehicleFieldRule {
    REQUIRED,
    OPTIONAL,
    /** Not asked for this type; the value is cleared on save. */
    HIDDEN
}
