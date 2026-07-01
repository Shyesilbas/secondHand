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
}
