package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import lombok.Getter;

@Getter
public enum ElectronicType {
    MOBILE_PHONE("Mobile Phone"),
    LAPTOP("Laptop"),
    TV("TV"),
    AIR_CONDITIONER("Air Conditioner"),
    WASHING_MACHINE("Washing Machine"),
    KITCHENARY("Kitchen Appliances"),
    GAMES_CONSOLE("Game Console"),
    HEADPHONES("Headphones"),
    MICROPHONE("Microphone"),
    SPEAKER("Speaker"),
    TV_STB("TV Set-Top Box"),
    VIDEO_PLAYER("Video Player"),
    TABLET("Tablet"),
    CAMERA("Camera");

    private final String label;

    ElectronicType(String label) {
        this.label = label;
    }
}
