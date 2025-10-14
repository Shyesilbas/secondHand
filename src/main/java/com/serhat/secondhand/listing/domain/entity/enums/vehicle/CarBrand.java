package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum CarBrand {
    AUDI("Audi"),
    BMW("BMW"),
    MERCEDES("Mercedes-Benz"),
    TOYOTA("Toyota"),
    VOLKSWAGEN("Volkswagen"),
    HYUNDAI("Hyundai"),
    PEUGEOT("Peugeot"),
    NISSAN("Nissan"),
    KIA("Kia"),
    FORD("Ford"),
    SUZUKI("Suzuki"),
    TOGG("TOGG"),
    RENAULT("Renault"),
    SKODA("Škoda"),
    SEAT("SEAT"),
    CUPRA("Cupra"),
    HONDA("Honda"),
    OPEL("Opel"),
    TESLA("Tesla"),
    FIAT("Fiat"),
    JEEP("Jeep"),
    VOLVO("Volvo"),
    CITROEN("Citroen"),
    MAZDA("Mazda"),
    MINI("Mini Cooper"),
    PORSCHE("Porsche"),
    ALFA_ROMEO("Alfa Romeo"),
    LAND_ROVER("Land Rover");

    private final String label;

    CarBrand(String label) {
        this.label = label;
    }
}
