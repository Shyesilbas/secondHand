package com.serhat.secondhand.email.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.email")
public class EmailConfig {

    private boolean mock = true;
    private String sender = "secondhand@noreply.com";

    private String verificationSubject = "SecondHand - Account Verification Code";
    private String passwordResetSubject = "SecondHand - Password Reset Code";
    private String welcomeSubject = "Welcome to SecondHand!";
    private String phoneUpdateSubject = "SecondHand - Phone Number Updated";
    private String paymentSuccessSubject = "SecondHand - Payment Successful";
    private String priceChangeSubject = "SecondHand - Price Changed on a Favorite Listing";
    private String orderConfirmationSubject = "SecondHand - Order Confirmation";
    private String saleNotificationSubject = "SecondHand - Your Item Has Been Sold!";
    private String paymentVerificationSubject = "SecondHand - Payment Verification";
    private String greatSellerSubject = "SecondHand - Great Seller badge";

    private Agreement agreement = new Agreement();
    private Order order = new Order();
    private Offer offer = new Offer();
    private Follow follow = new Follow();

    @Getter
    @Setter
    public static class Agreement {
        private String subjectPrefix = "SecondHand: ";
    }

    @Getter
    @Setter
    public static class Order {
        private String cancelledSubject = "SecondHand - Order Cancelled";
        private String completedSubject = "SecondHand - Order Completed";
        private String refundedSubject = "SecondHand - Order Refunded";
    }

    @Getter
    @Setter
    public static class Offer {
        private String receivedSubject = "SecondHand - New Offer Received";
        private String counterReceivedSubject = "SecondHand - Counter Offer Received";
        private String acceptedSubject = "SecondHand - Offer Accepted";
        private String rejectedSubject = "SecondHand - Offer Rejected";
        private String expiredSubject = "SecondHand - Offer Expired";
        private String completedSubject = "SecondHand - Offer Completed";
    }

    @Getter
    @Setter
    public static class Follow {
        private String newListingSubjectFormat = "%s %s yeni bir ilan ekledi!";
    }
}
