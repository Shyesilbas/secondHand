package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.listing.domain.entity.ElectronicListing;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * The listing spec fields an electronic type rules over (data/electronics/types.json "fields").
 * Every type must name every field here; the seed refuses a type that does not.
 */
public final class ElectronicSpecFields {

    public record Field(String name, String label, String errorCode,
                        Function<ElectronicListing, Object> getter, Consumer<ElectronicListing> clearer) {
    }

    public static final Map<String, Field> ALL = new LinkedHashMap<>();

    static {
        add("ram", "RAM", ElectronicListing::getRam, l -> l.setRam(null));
        add("storage", "Storage", ElectronicListing::getStorage, l -> l.setStorage(null));
        add("storageType", "Storage type", ElectronicListing::getStorageType, l -> l.setStorageType(null));
        add("processor", "Processor", ElectronicListing::getProcessor, l -> l.setProcessor(null));
        add("chipset", "Chipset", ElectronicListing::getChipset, l -> l.setChipset(null));
        add("screenSize", "Screen size", ElectronicListing::getScreenSize, l -> l.setScreenSize(null));
        add("gpuModel", "GPU model", ElectronicListing::getGpuModel, l -> l.setGpuModel(null));
        add("operatingSystem", "Operating system", ElectronicListing::getOperatingSystem, l -> l.setOperatingSystem(null));
        add("batteryCapacityMah", "Battery capacity", ElectronicListing::getBatteryCapacityMah, l -> l.setBatteryCapacityMah(null));
        add("cameraMegapixels", "Camera", ElectronicListing::getCameraMegapixels, l -> l.setCameraMegapixels(null));
        add("supports5g", "5G", ElectronicListing::getSupports5g, l -> l.setSupports5g(null));
        add("dualSim", "Dual SIM", ElectronicListing::getDualSim, l -> l.setDualSim(null));
        add("hasNfc", "NFC", ElectronicListing::getHasNfc, l -> l.setHasNfc(null));
        add("connectionType", "Connection type", ElectronicListing::getConnectionType, l -> l.setConnectionType(null));
        add("wireless", "Wireless", ElectronicListing::getWireless, l -> l.setWireless(null));
        add("noiseCancelling", "Noise cancelling", ElectronicListing::getNoiseCancelling, l -> l.setNoiseCancelling(null));
        add("hasMicrophone", "Microphone", ElectronicListing::getHasMicrophone, l -> l.setHasMicrophone(null));
        add("batteryLifeHours", "Battery life", ElectronicListing::getBatteryLifeHours, l -> l.setBatteryLifeHours(null));
    }

    private ElectronicSpecFields() {
    }

    private static void add(String name, String label,
                            Function<ElectronicListing, Object> getter, Consumer<ElectronicListing> clearer) {
        String code = "ELECTRONIC_" + name.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toUpperCase(java.util.Locale.ROOT) + "_REQUIRED";
        ALL.put(name, new Field(name, label, code, getter, clearer));
    }
}
