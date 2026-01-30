package com.serhat.secondhand.listing.validation.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class HeadphonesValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (!isHeadphones(listing)) {
            return Result.success();
        }

        if (listing.getConnectionType() == null) {
            return Result.error("Connection type is required for headphones listings", "HEADPHONES_CONNECTION_TYPE_REQUIRED");
        }

        Boolean wireless = listing.getWireless();
        if (wireless == null) {
            ElectronicConnectionType ct = listing.getConnectionType();
            wireless = ct == ElectronicConnectionType.BLUETOOTH || ct == ElectronicConnectionType.BOTH;
            listing.setWireless(wireless);
        }

        if (Boolean.TRUE.equals(wireless)) {
            if (listing.getBatteryLifeHours() == null || listing.getBatteryLifeHours() <= 0) {
                return Result.error("Battery life hours is required for wireless headphones listings", "HEADPHONES_BATTERY_LIFE_REQUIRED");
            }
        } else {
            listing.setBatteryLifeHours(null);
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (isHeadphones(listing)) {
            listing.setRam(null);
            listing.setStorage(null);
            listing.setStorageType(null);
            listing.setProcessor(null);
            listing.setScreenSize(null);
            listing.setGpuModel(null);
            listing.setOperatingSystem(null);
            listing.setBatteryHealthPercent(null);
            listing.setBatteryCapacityMah(null);
            listing.setCameraMegapixels(null);
            listing.setSupports5g(null);
            listing.setDualSim(null);
            listing.setHasNfc(null);
            return;
        }

        listing.setConnectionType(null);
        listing.setWireless(null);
        listing.setNoiseCancelling(null);
        listing.setHasMicrophone(null);
        listing.setBatteryLifeHours(null);
    }

    private boolean isHeadphones(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "HEADPHONES".equalsIgnoreCase(type.getName());
    }
}

