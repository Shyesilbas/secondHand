package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.listing.domain.entity.VehicleListing;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * The listing spec fields a vehicle type rules over (data/vehicles/types.json "fields").
 * Every type must name every field here; the seed refuses a type that does not.
 */
public final class VehicleSpecFields {

    public record Field(String name, String label, String errorCode,
                        Function<VehicleListing, Object> getter, Consumer<VehicleListing> clearer) {
    }

    public static final Map<String, Field> ALL = new LinkedHashMap<>();

    static {
        add("mileage", "Mileage", "VEHICLE_MILEAGE_REQUIRED", VehicleListing::getMileage, l -> l.setMileage(null));
        add("fuelType", "Fuel type", "VEHICLE_FUEL_TYPE_REQUIRED", VehicleListing::getFuelType, l -> l.setFuelType(null));
        add("gearbox", "Gear type", "VEHICLE_GEAR_TYPE_REQUIRED", VehicleListing::getGearbox, l -> l.setGearbox(null));
        add("bodyType", "Body type", "VEHICLE_BODY_TYPE_REQUIRED", VehicleListing::getBodyType, l -> l.setBodyType(null));
        add("engineCapacity", "Engine capacity", "VEHICLE_ENGINE_CAPACITY_REQUIRED",
                VehicleListing::getEngineCapacity, l -> l.setEngineCapacity(null));
        add("horsePower", "Horse power", "VEHICLE_HORSE_POWER_REQUIRED",
                VehicleListing::getHorsePower, l -> l.setHorsePower(null));
        add("drivetrain", "Drivetrain", "VEHICLE_DRIVETRAIN_REQUIRED",
                VehicleListing::getDrivetrain, l -> l.setDrivetrain(null));
        add("doors", "Doors", "VEHICLE_DOORS_REQUIRED", VehicleListing::getDoors, l -> l.setDoors(null));
        add("seatCount", "Seat count", "VEHICLE_SEAT_COUNT_REQUIRED",
                VehicleListing::getSeatCount, l -> l.setSeatCount(null));
        add("wheels", "Wheel size", "VEHICLE_WHEELS_REQUIRED", VehicleListing::getWheels, l -> l.setWheels(null));
        add("fuelCapacity", "Fuel capacity", "VEHICLE_FUEL_CAPACITY_REQUIRED",
                VehicleListing::getFuelCapacity, l -> l.setFuelCapacity(null));
        add("fuelConsumption", "Fuel consumption", "VEHICLE_FUEL_CONSUMPTION_REQUIRED",
                VehicleListing::getFuelConsumption, l -> l.setFuelConsumption(null));
        add("kilometersPerLiter", "Kilometers per liter", "VEHICLE_KILOMETERS_PER_LITER_REQUIRED",
                VehicleListing::getKilometersPerLiter, l -> l.setKilometersPerLiter(null));
        add("inspectionValidUntil", "Inspection date", "VEHICLE_INSPECTION_DATE_REQUIRED",
                VehicleListing::getInspectionValidUntil, l -> l.setInspectionValidUntil(null));
    }

    private VehicleSpecFields() {
    }

    private static void add(String name, String label, String errorCode,
                            Function<VehicleListing, Object> getter, Consumer<VehicleListing> clearer) {
        ALL.put(name, new Field(name, label, errorCode, getter, clearer));
    }
}
