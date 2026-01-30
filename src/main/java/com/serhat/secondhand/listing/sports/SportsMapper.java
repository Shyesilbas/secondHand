package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import org.springframework.stereotype.Component;

@Component
public class SportsMapper {
    public void updateEntityFromRequest(SportsListing entity, SportsUpdateRequest request) {
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
    }
}

