package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.listing.domain.entity.RealEstateListing;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * The listing fields a real estate type rules over (data/realestate/realestate.json "fields").
 * Every type must name every field here; the seed refuses a type that does not. Toggle fields can only be
 * OPTIONAL or HIDDEN (a hidden toggle is stored as false).
 */
public final class RealEstateSpecFields {

    public record Field(String name, String label, boolean toggle, String errorCode,
                        Function<RealEstateListing, Object> getter, Consumer<RealEstateListing> clearer) {
    }

    public static final Map<String, Field> ALL = new LinkedHashMap<>();

    static {
        add("heatingType", "Heating type", RealEstateListing::getHeatingType, l -> l.setHeatingType(null));
        add("grossAreaM2", "Gross area", RealEstateListing::getGrossAreaM2, l -> l.setGrossAreaM2(null));
        add("netAreaM2", "Net area", RealEstateListing::getNetAreaM2, l -> l.setNetAreaM2(null));
        add("roomConfigKey", "Room plan", RealEstateListing::getRoomConfigKey, l -> l.setRoomConfigKey(null));
        add("bathroomCount", "Bathroom count", RealEstateListing::getBathroomCount, l -> l.setBathroomCount(null));
        add("floorKey", "Floor", RealEstateListing::getFloorKey, l -> l.setFloorKey(null));
        add("totalFloors", "Total floors", RealEstateListing::getTotalFloors, l -> l.setTotalFloors(null));
        add("buildingAge", "Building age", RealEstateListing::getBuildingAge, l -> l.setBuildingAge(null));
        add("buildingCondition", "Building condition", RealEstateListing::getBuildingCondition, l -> l.setBuildingCondition(null));
        toggle("furnished", "Furnished", l -> l.setFurnished(false));
        toggle("hasBalcony", "Balcony", l -> l.setHasBalcony(false));
        toggle("hasElevator", "Elevator", l -> l.setHasElevator(false));
        toggle("hasParking", "Parking", l -> l.setHasParking(false));
        add("monthlyFee", "Monthly fee", RealEstateListing::getMonthlyFee, l -> l.setMonthlyFee(null));
        toggle("inSite", "In a site", l -> l.setInSite(false));
        add("siteName", "Site name", RealEstateListing::getSiteName, l -> l.setSiteName(null));
        add("gardenAreaM2", "Garden area", RealEstateListing::getGardenAreaM2, l -> l.setGardenAreaM2(null));
        add("landShareM2", "Land share", RealEstateListing::getLandShareM2, l -> l.setLandShareM2(null));
        toggle("hasPool", "Pool", l -> l.setHasPool(false));
        add("zoningStatusKey", "Zoning status", RealEstateListing::getZoningStatusKey, l -> l.setZoningStatusKey(null));
        add("parcelNo", "Parcel no", RealEstateListing::getParcelNo, l -> l.setParcelNo(null));
        add("blockNo", "Block no", RealEstateListing::getBlockNo, l -> l.setBlockNo(null));
        add("sheetNo", "Sheet no", RealEstateListing::getSheetNo, l -> l.setSheetNo(null));
        add("floorAreaRatio", "Floor area ratio", RealEstateListing::getFloorAreaRatio, l -> l.setFloorAreaRatio(null));
        add("heightLimit", "Height limit", RealEstateListing::getHeightLimit, l -> l.setHeightLimit(null));
        add("roadFrontage", "Road frontage", RealEstateListing::getRoadFrontage, l -> l.setRoadFrontage(null));
        add("infrastructureStatusKey", "Infrastructure", RealEstateListing::getInfrastructureStatusKey, l -> l.setInfrastructureStatusKey(null));
        toggle("electricityAvailable", "Electricity", l -> l.setElectricityAvailable(false));
        toggle("roadAccess", "Road access", l -> l.setRoadAccess(false));
        toggle("exchangeable", "Exchange", l -> l.setExchangeable(false));
    }

    private RealEstateSpecFields() {
    }

    private static void add(String name, String label,
                            Function<RealEstateListing, Object> getter, Consumer<RealEstateListing> clearer) {
        ALL.put(name, new Field(name, label, false, errorCode(name), getter, clearer));
    }

    private static void toggle(String name, String label, Consumer<RealEstateListing> clearer) {
        ALL.put(name, new Field(name, label, true, errorCode(name), l -> null, clearer));
    }

    private static String errorCode(String name) {
        return "REAL_ESTATE_" + name.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toUpperCase(java.util.Locale.ROOT) + "_REQUIRED";
    }
}
