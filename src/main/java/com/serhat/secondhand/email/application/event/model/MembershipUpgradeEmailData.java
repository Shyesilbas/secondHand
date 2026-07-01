package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipUpgradeEmailData {
    private String userName;
    private String amount;
    private String paymentId;
    private String date;
    private String expiryDate;
}
