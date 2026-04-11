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
    private String verificationContent;

    private String welcomeSubject;
    private String welcomeContent;

    private String phoneUpdateSubject;
    private String phoneUpdateContent;

    private String paymentSuccessSubject;
    private String paymentSuccessContent;

    private String priceChangeSubject;
    private String priceChangeContent;

    private String orderConfirmationSubject;
    private String saleNotificationSubject;

    private String paymentVerificationSubject;
    private String paymentVerificationContent;

    private Agreement agreement = new Agreement();
    private Order order = new Order();
    private Offer offer = new Offer();
    private Follow follow = new Follow();

    @Getter
    @Setter
    public static class Agreement {
        private String subjectPrefix;
        private String bodyFooter;
    }

    @Getter
    @Setter
    public static class Order {
        private String cancelledSubject;
        private String completedSubject;
        private String refundedSubject;

        private String customerGreetingFormat;
        private String customerIntroLine;
        private String customerOrderNumberLabel;
        private String customerStatusLabel;
        private String customerPaymentStatusLabel;
        private String customerTotalLabel;
        private String customerShippingAddressLabel;
        private String customerItemsLabel;
        private String customerItemFallbackTitle;
        private String customerItemLineFormat;
        private String customerNotesLabel;
        private String customerPaymentReferenceLabel;
        private String customerClosing;

        private String sellerGreetingFormat;
        private String sellerIntroLine;
        private String sellerOrderNumberLabel;
        private String sellerTotalAmountLabel;
        private String sellerSoldItemsLabel;
        private String sellerShippingAddressLabel;
        private String sellerItemFallbackTitle;
        private String sellerItemLineFormat;
        private String sellerPrepLine;
        private String sellerClosing;

        private String cancellationContentFormat;
        private String refundContentFormat;
        private String completionContentFormat;
        private String completionManualWord;
        private String completionAutomaticWord;
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

        private String receivedHeadline;
        private String counterReceivedHeadline;
        private String acceptedHeadline;
        private String rejectedHeadline;
        private String expiredHeadline;
        private String completedHeadline;
        private String acceptedNextStepLine;

        private String greeting;
        private String listingLabel;
        private String quantityLabel;
        private String totalPriceLabel;
        private String unitPriceLabel;
        private String expiresAtLabel;
        private String listingFallback;
        private String closing;
    }

    @Getter
    @Setter
    public static class Follow {
        private String newListingSubjectFormat;
        private String greetingFormat;
        private String sellerIntroFormat;
        private String titlePrefix;
        private String pricePrefix;
        private String cityPrefix;
        private String visitLine;
        private String footerSeparator;
        private String manageNotificationLine;
    }
}
