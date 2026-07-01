package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferEmailData {
    private String userName;
    private String headerTitle;
    private String headline;
    private String listingTitle;
    private int quantity;
    private String totalPrice;
    private String unitPrice;
    private String expiresAt;
    private String nextStep;
}
