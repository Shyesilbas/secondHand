package com.serhat.secondhand.listing.validation.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

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
        if (listing.getScreenSize() == null || listing.getScreenSize() <= 0) {
            return Result.error("Screen size is required for mobile phone listings", "MOBILE_PHONE_SCREEN_SIZE_REQUIRED");
        }
        if (listing.getBatteryCapacityMah() == null || listing.getBatteryCapacityMah() <= 0) {
            return Result.error("Battery capacity is required for mobile phone listings", "MOBILE_PHONE_BATTERY_CAPACITY_REQUIRED");
        }

        Integer cameraMp = listing.getCameraMegapixels();
        if (cameraMp != null && cameraMp <= 0) {
            return Result.error("Camera megapixels must be greater than 0", "MOBILE_PHONE_CAMERA_MP_INVALID");
        }

        if (listing.getYear() == null || listing.getYear() < 2000) {
            return Result.error("Year is required for mobile phone listings", "MOBILE_PHONE_YEAR_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (!isMobilePhone(listing)) {
            return;
        }
        
        {
            listing.setStorageType(null);
            listing.setGpuModel(null);
            listing.setOperatingSystem(null);
            listing.setBatteryHealthPercent(null);
            listing.setConnectionType(null);
            listing.setWireless(null);
            listing.setNoiseCancelling(null);
            listing.setHasMicrophone(null);
            listing.setBatteryLifeHours(null);
        }
    }

    private boolean isMobilePhone(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "MOBILE_PHONE".equalsIgnoreCase(type.getName());
    }
}

