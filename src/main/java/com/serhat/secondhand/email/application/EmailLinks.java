package com.serhat.secondhand.email.application;

import java.util.UUID;

/**
 * Frontend paths that emails link to. They are relative because emails are read in the in-app inbox,
 * where they resolve against the frontend origin; each must match a route in the frontend's routes.js.
 */
public final class EmailLinks {

    public static final String PAYMENTS = "/payments";
    public static final String WALLET = "/payment-methods";
    public static final String MY_ORDERS = "/profile/orders";
    public static final String MY_SALES = "/profile/i-sold";
    public static final String MY_LISTINGS = "/my-listings";
    public static final String MY_SHOWCASES = "/my-showcases";
    public static final String PROFILE = "/profile";
    public static final String AGREEMENTS = "/agreements";

    private EmailLinks() {
    }

    public static String listing(UUID listingId) {
        return "/listings/" + listingId;
    }
}
