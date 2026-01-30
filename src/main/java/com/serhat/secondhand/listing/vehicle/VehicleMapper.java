package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {
    public void updateEntityFromRequest(VehicleListing entity, VehicleUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }

        if (request.base() != null) {
            if (request.base().title() != null) request.base().title().ifPresent(entity::setTitle);
            if (request.base().description() != null) request.base().description().ifPresent(entity::setDescription);
            if (request.base().price() != null) request.base().price().ifPresent(entity::setPrice);
            if (request.base().currency() != null) request.base().currency().ifPresent(entity::setCurrency);
            if (request.base().city() != null) request.base().city().ifPresent(entity::setCity);
            if (request.base().district() != null) request.base().district().ifPresent(entity::setDistrict);
            if (request.base().imageUrl() != null) request.base().imageUrl().ifPresent(entity::setImageUrl);
        }

        if (request.year() != null) request.year().ifPresent(entity::setYear);
        if (request.mileage() != null) request.mileage().ifPresent(entity::setMileage);
        if (request.engineCapacity() != null) request.engineCapacity().ifPresent(entity::setEngineCapacity);
        if (request.gearbox() != null) request.gearbox().ifPresent(entity::setGearbox);
        if (request.seatCount() != null) request.seatCount().ifPresent(entity::setSeatCount);
        if (request.doors() != null) request.doors().ifPresent(entity::setDoors);
        if (request.wheels() != null) request.wheels().ifPresent(entity::setWheels);
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.fuelCapacity() != null) request.fuelCapacity().ifPresent(entity::setFuelCapacity);
        if (request.fuelConsumption() != null) request.fuelConsumption().ifPresent(entity::setFuelConsumption);
        if (request.horsePower() != null) request.horsePower().ifPresent(entity::setHorsePower);
        if (request.kilometersPerLiter() != null) request.kilometersPerLiter().ifPresent(entity::setKilometersPerLiter);
        if (request.fuelType() != null) request.fuelType().ifPresent(entity::setFuelType);
        if (request.swap() != null) request.swap().ifPresent(entity::setSwap);
        if (request.accidentHistory() != null) request.accidentHistory().ifPresent(entity::setAccidentHistory);
        if (request.accidentDetails() != null) request.accidentDetails().ifPresent(entity::setAccidentDetails);
        if (request.inspectionValidUntil() != null) request.inspectionValidUntil().ifPresent(entity::setInspectionValidUntil);
        if (request.drivetrain() != null) request.drivetrain().ifPresent(entity::setDrivetrain);
        if (request.bodyType() != null) request.bodyType().ifPresent(entity::setBodyType);
    }
}

