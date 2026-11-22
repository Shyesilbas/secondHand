package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderConfirmationEmailData {
    private String userName;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String totalAmount;
    private List<?> items;
    private String deliveryMethod;
    private String meetupLocation;
    private String meetupVerificationCode;
    private String shippingAddress;
    private String orderDate;
    private String paymentMethod;
    private String notes;
    /** Seller sale mail breakdown; all null when no platform coupon was used. */
    private String couponCode;
    private String listingAmount;
    private String couponDiscountAmount;
    private String paidAmount;
    private String payoutAmount;
}
