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

    private String sender;

    private String verificationSubject;
    private String passwordResetSubject;
    private String welcomeSubject;
    private String phoneUpdateSubject;
    private String paymentSuccessSubject;
    private String priceChangeSubject;
    private String orderConfirmationSubject;
    private String saleNotificationSubject;
    private String paymentVerificationSubject;
    private String greatSellerSubject;

    private Agreement agreement = new Agreement();
    private Order order = new Order();
    private Offer offer = new Offer();
    private Follow follow = new Follow();

    @Getter
    @Setter
    public static class Agreement {
        private String subjectPrefix;
    }

    @Getter
    @Setter
    public static class Order {
        private String cancelledSubject;
        private String completedSubject;
        private String refundedSubject;
    }

    @Getter
    @Setter
    public static class Offer {
        private String receivedSubject;
        private String counterReceivedSubject;
        private String acceptedSubject;
        private String rejectedSubject;
        private String expiredSubject;
        private String completedSubject;
    }

    @Getter
    @Setter
    public static class Follow {
        private String newListingSubjectFormat;
    }
}
