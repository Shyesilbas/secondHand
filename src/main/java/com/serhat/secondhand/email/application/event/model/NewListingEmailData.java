package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewListingEmailData {
    private String userName;
    private String headerTitle;
    private String introText;
    private String listingTitle;
    private String listingPrice;
    private String listingCity;
    private String listingUrl;
    private String manageNotificationText;
    private String listingImage;
}
