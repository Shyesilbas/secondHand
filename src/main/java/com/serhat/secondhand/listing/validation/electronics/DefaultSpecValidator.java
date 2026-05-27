package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class DefaultSpecValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        // Default validator does not enforce strict validation rules.
        // It serves purely as a safety net for non-specialized types.
        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (listing == null || isSpecializedType(listing)) {
            return;
        }

        // --- Cleanup Phone Specific Fields ---
        listing.setBatteryHealthPercent(null);
        listing.setBatteryReplaced(null);
        listing.setBatteryOriginal(null);
        listing.setScreenReplaced(null);
        listing.setBodyReplaced(null);
        listing.setFaceIdWorking(null);
        listing.setTouchIdWorking(null);
        listing.setImeiRegistered(null);
        listing.setSupports5g(null);
        listing.setDualSim(null);
        listing.setHasNfc(null);
        listing.setCameraMegapixels(null);
        listing.setBatteryCapacityMah(null);

        // --- Cleanup Computer Specific Fields ---
        listing.setRam(null);
        listing.setProcessor(null);
        listing.setStorageType(null);
        listing.setGpuModel(null);
        listing.setOperatingSystem(null);

        // --- Cleanup Headphones/Audio Specific Fields ---
        listing.setConnectionType(null);
        listing.setWireless(null);
        listing.setNoiseCancelling(null);
        listing.setHasMicrophone(null);
        listing.setBatteryLifeHours(null);
    }

    private boolean isSpecializedType(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String typeName = type.getName().toUpperCase();
        return "MOBILE_PHONE".equals(typeName)
                || "LAPTOP".equals(typeName)
                || "DESKTOP".equals(typeName)
                || "HEADPHONES".equals(typeName);
    }
}
