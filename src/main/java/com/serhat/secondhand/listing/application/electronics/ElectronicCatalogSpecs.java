package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;

/**
 * Keys allowed in an electronic model's or variant's {@code specs} (data/electronics/&lt;type&gt;/&lt;brand&gt;.json).
 * {@link #COPIED} keys are copied onto the listing column of the same name; {@link #DISPLAY_ONLY} keys are shown
 * from the catalog but have no listing column. The seed rejects any other key and any value of the wrong kind.
 */
public final class ElectronicCatalogSpecs {

    public enum Kind { INTEGER, DECIMAL, BOOLEAN, TEXT, PROCESSOR, CONNECTION_TYPE }

    public record CopiedSpec(Kind kind, BiConsumer<ElectronicListing, Object> setter) {
    }

    public static final Map<String, CopiedSpec> COPIED = new LinkedHashMap<>();

    public static final Map<String, Kind> DISPLAY_ONLY = new LinkedHashMap<>();

    static {
        COPIED.put("processor", new CopiedSpec(Kind.PROCESSOR, (l, v) -> l.setProcessor((Processor) v)));
        COPIED.put("chipset", new CopiedSpec(Kind.TEXT, (l, v) -> l.setChipset((String) v)));
        COPIED.put("screenSize", new CopiedSpec(Kind.INTEGER, (l, v) -> l.setScreenSize((Integer) v)));
        COPIED.put("gpuModel", new CopiedSpec(Kind.TEXT, (l, v) -> l.setGpuModel((String) v)));
        COPIED.put("operatingSystem", new CopiedSpec(Kind.TEXT, (l, v) -> l.setOperatingSystem((String) v)));
        COPIED.put("batteryCapacityMah", new CopiedSpec(Kind.INTEGER, (l, v) -> l.setBatteryCapacityMah((Integer) v)));
        COPIED.put("cameraMegapixels", new CopiedSpec(Kind.INTEGER, (l, v) -> l.setCameraMegapixels((Integer) v)));
        COPIED.put("supports5g", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setSupports5g((Boolean) v)));
        COPIED.put("dualSim", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setDualSim((Boolean) v)));
        COPIED.put("hasNfc", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setHasNfc((Boolean) v)));
        COPIED.put("connectionType", new CopiedSpec(Kind.CONNECTION_TYPE,
                (l, v) -> l.setConnectionType((ElectronicConnectionType) v)));
        COPIED.put("wireless", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setWireless((Boolean) v)));
        COPIED.put("noiseCancelling", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setNoiseCancelling((Boolean) v)));
        COPIED.put("hasMicrophone", new CopiedSpec(Kind.BOOLEAN, (l, v) -> l.setHasMicrophone((Boolean) v)));
        COPIED.put("batteryLifeHours", new CopiedSpec(Kind.INTEGER, (l, v) -> l.setBatteryLifeHours((Integer) v)));

        DISPLAY_ONLY.put("screenInches", Kind.DECIMAL);
        DISPLAY_ONLY.put("displayType", Kind.TEXT);
        DISPLAY_ONLY.put("refreshRateHz", Kind.INTEGER);
        DISPLAY_ONLY.put("frontCameraMegapixels", Kind.INTEGER);
        DISPLAY_ONLY.put("chargingWatts", Kind.INTEGER);
        DISPLAY_ONLY.put("wirelessCharging", Kind.BOOLEAN);
        DISPLAY_ONLY.put("ipRating", Kind.TEXT);
        DISPLAY_ONLY.put("weightGrams", Kind.INTEGER);
    }

    /** Variant columns; a variant's {@code specs} may not repeat them. */
    public static final Set<String> VARIANT_COLUMNS = Set.of("ram", "storage", "storageType", "processor", "chipset", "gpuModel");

    private ElectronicCatalogSpecs() {
    }

    /** Converts a raw JSON value to the Java type of the key's kind, or throws with the reason. */
    public static Object convert(String key, Kind kind, Object raw) {
        return switch (kind) {
            case INTEGER -> {
                if (raw instanceof Number n && n.doubleValue() == Math.rint(n.doubleValue()) && n.intValue() > 0) {
                    yield n.intValue();
                }
                throw new IllegalArgumentException(key + " must be a positive whole number, got " + raw);
            }
            case DECIMAL -> {
                if (raw instanceof Number n && n.doubleValue() > 0) yield n;
                throw new IllegalArgumentException(key + " must be a positive number, got " + raw);
            }
            case BOOLEAN -> {
                if (raw instanceof Boolean b) yield b;
                throw new IllegalArgumentException(key + " must be true or false, got " + raw);
            }
            case TEXT -> {
                if (raw instanceof String s && !s.isBlank()) yield s.trim();
                throw new IllegalArgumentException(key + " must be non-blank text, got " + raw);
            }
            case PROCESSOR -> Processor.valueOf(String.valueOf(raw));
            case CONNECTION_TYPE -> ElectronicConnectionType.valueOf(String.valueOf(raw));
        };
    }

    public static Kind kindOf(String key) {
        CopiedSpec copied = COPIED.get(key);
        if (copied != null) return copied.kind();
        return DISPLAY_ONLY.get(key);
    }
}
