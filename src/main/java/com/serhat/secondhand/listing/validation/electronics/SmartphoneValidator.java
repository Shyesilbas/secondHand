package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

/**
 * Validates and cleans up smartphone-specific fields.
 *
 * <b>cleanup() contract:</b> When the listing IS a mobile phone, nullify fields
 * that belong to other device categories (computers, headphones).
 * Phone-specific fields (dualSim, supports5g, cameraMegapixels, etc.) are
 * intentionally kept — they describe the device.
 *
 * When the listing is NOT a mobile phone, nullify phone-exclusive fields
 * so they don't leak into other device types.
 */
@Component
public class SmartphoneValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (!isMobilePhone(listing)) {
            return Result.success();
        }

        if (listing.getStorage() == null || listing.getStorage() <= 0) {
            return Result.error("Storage is required for mobile phone listings", "MOBILE_PHONE_STORAGE_REQUIRED");
        }

        if (listing.getCameraMegapixels() != null && listing.getCameraMegapixels() < 0) {
            return Result.error("Camera megapixels must be 0 or greater", "MOBILE_PHONE_CAMERA_INVALID");
        }

        if (listing.getBatteryCapacityMah() != null && listing.getBatteryCapacityMah() < 0) {
            return Result.error("Battery capacity must be 0 or greater", "MOBILE_PHONE_BATTERY_CAPACITY_INVALID");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (listing == null) return;

        if (isMobilePhone(listing)) {
            // Phone listing: nullify non-phone device fields
            listing.setRam(null);
            listing.setProcessor(null);
            listing.setStorageType(null);
            listing.setGpuModel(null);
            listing.setOperatingSystem(null);
            listing.setScreenSize(null);
            listing.setBatteryHealthPercent(null);
            // Headphones fields
            listing.setConnectionType(null);
            listing.setWireless(null);
            listing.setNoiseCancelling(null);
            listing.setHasMicrophone(null);
            listing.setBatteryLifeHours(null);
        } else {
            // Non-phone listing: nullify phone-exclusive fields
            listing.setDualSim(null);
            listing.setSupports5g(null);
            listing.setHasNfc(null);
            listing.setCameraMegapixels(null);
            listing.setBatteryCapacityMah(null);
            listing.setBatteryReplaced(null);
            listing.setBatteryOriginal(null);
            listing.setScreenReplaced(null);
            listing.setBodyReplaced(null);
            listing.setFaceIdWorking(null);
            listing.setTouchIdWorking(null);
            listing.setImeiRegistered(null);
        }
    }

    private boolean isMobilePhone(ElectronicListing listing) {
        if (listing == null) return false;
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) return false;
        return "MOBILE_PHONE".equalsIgnoreCase(type.getName());
    }
}
