package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ClothingMapper {
    public void updateEntityFromRequest(ClothingListing entity, ClothingUpdateRequest request) {
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

        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.purchaseYear() != null) request.purchaseYear().ifPresent(y -> entity.setPurchaseDate(toPurchaseDate(y)));
        if (request.condition() != null) request.condition().ifPresent(entity::setCondition);
        if (request.size() != null) request.size().ifPresent(entity::setSize);
        if (request.shoeSizeEu() != null) request.shoeSizeEu().ifPresent(entity::setShoeSizeEu);
        if (request.material() != null) request.material().ifPresent(entity::setMaterial);
        if (request.clothingGender() != null) request.clothingGender().ifPresent(entity::setClothingGender);
        if (request.clothingCategory() != null) request.clothingCategory().ifPresent(entity::setClothingCategory);
    }

    private LocalDate toPurchaseDate(Integer year) {
        if (year == null) {
            return null;
        }
        return LocalDate.of(year, 1, 1);
    }
}
