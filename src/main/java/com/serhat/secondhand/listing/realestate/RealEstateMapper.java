package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import org.springframework.stereotype.Component;

@Component
public class RealEstateMapper {
    public void updateEntityFromRequest(RealEstateListing entity, RealEstateUpdateRequest request) {
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

        if (request.squareMeters() != null) request.squareMeters().ifPresent(entity::setSquareMeters);
        if (request.roomCount() != null) request.roomCount().ifPresent(entity::setRoomCount);
        if (request.bathroomCount() != null) request.bathroomCount().ifPresent(entity::setBathroomCount);
        if (request.floor() != null) request.floor().ifPresent(entity::setFloor);
        if (request.buildingAge() != null) request.buildingAge().ifPresent(entity::setBuildingAge);
        if (request.furnished() != null) request.furnished().ifPresent(entity::setFurnished);
        if (request.zoningStatus() != null) request.zoningStatus().ifPresent(entity::setZoningStatus);
    }
}

