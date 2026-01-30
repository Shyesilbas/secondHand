package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import org.springframework.stereotype.Component;

@Component
public class ElectronicMapper {
    public void updateEntityFromRequest(ElectronicListing entity, ElectronicUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }

        BaseListingUpdateRequest base = request.base();
        if (base != null) {
            if (base.title() != null) base.title().ifPresent(entity::setTitle);
            if (base.description() != null) base.description().ifPresent(entity::setDescription);
            if (base.price() != null) base.price().ifPresent(entity::setPrice);
            if (base.currency() != null) base.currency().ifPresent(entity::setCurrency);
            if (base.city() != null) base.city().ifPresent(entity::setCity);
            if (base.district() != null) base.district().ifPresent(entity::setDistrict);
            if (base.imageUrl() != null) base.imageUrl().ifPresent(entity::setImageUrl);
        }

        if (request.origin() != null) request.origin().ifPresent(entity::setOrigin);
        if (request.warrantyProof() != null) request.warrantyProof().ifPresent(entity::setWarrantyProof);
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.year() != null) request.year().ifPresent(entity::setYear);

        if (request.ram() != null) request.ram().ifPresent(entity::setRam);
        if (request.storage() != null) request.storage().ifPresent(entity::setStorage);
        if (request.storageType() != null) request.storageType().ifPresent(entity::setStorageType);
        if (request.processor() != null) request.processor().ifPresent(entity::setProcessor);
        if (request.screenSize() != null) request.screenSize().ifPresent(entity::setScreenSize);
        if (request.gpuModel() != null) request.gpuModel().ifPresent(entity::setGpuModel);
        if (request.operatingSystem() != null) request.operatingSystem().ifPresent(entity::setOperatingSystem);

        if (request.batteryHealthPercent() != null) request.batteryHealthPercent().ifPresent(entity::setBatteryHealthPercent);
        if (request.batteryCapacityMah() != null) request.batteryCapacityMah().ifPresent(entity::setBatteryCapacityMah);
        if (request.cameraMegapixels() != null) request.cameraMegapixels().ifPresent(entity::setCameraMegapixels);

        if (request.supports5g() != null) request.supports5g().ifPresent(entity::setSupports5g);
        if (request.dualSim() != null) request.dualSim().ifPresent(entity::setDualSim);
        if (request.hasNfc() != null) request.hasNfc().ifPresent(entity::setHasNfc);

        if (request.connectionType() != null) request.connectionType().ifPresent(entity::setConnectionType);
        if (request.wireless() != null) request.wireless().ifPresent(entity::setWireless);
        if (request.noiseCancelling() != null) request.noiseCancelling().ifPresent(entity::setNoiseCancelling);
        if (request.hasMicrophone() != null) request.hasMicrophone().ifPresent(entity::setHasMicrophone);
        if (request.batteryLifeHours() != null) request.batteryLifeHours().ifPresent(entity::setBatteryLifeHours);
    }
}

