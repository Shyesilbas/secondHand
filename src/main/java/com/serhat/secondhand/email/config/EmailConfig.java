package com.serhat.secondhand.email.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@Getter
@ConfigurationProperties(prefix = "app.email")
public class EmailConfig {
    private final String sender;

    private final String verificationSubject;
    private final String verificationContent;

    private final String welcomeSubject;
    private final String welcomeContent;

    private final String phoneUpdateSubject;
    private final String phoneUpdateContent;

    private final String paymentSuccessSubject;
    private final String paymentSuccessContent;

    private final String priceChangeSubject;
    private final String priceChangeContent;

    private final String orderConfirmationSubject;
    private final String saleNotificationSubject;

    private final String paymentVerificationSubject;
    private final String paymentVerificationContent;

    public EmailConfig(
            @DefaultValue("secondhand@noreply.com") String sender,
            @DefaultValue("SecondHand - Account Verification Code") String verificationSubject,
            @DefaultValue("Hello %s,Please use the following code to verify your SecondHand account: Verification Code: %s This code is valid for 15 minutes.If you did not request this verification, please ignore this email. Best regards, SecondHand Team") String verificationContent,
            @DefaultValue("Welcome to SecondHand!") String welcomeSubject,
            @DefaultValue("Hello %s,Welcome to SecondHand! Your account has been successfully created. You can now: Sell your second-hand items Purchase items you like Communicate safely with other users Happy shopping! SecondHand Team") String welcomeContent,
            @DefaultValue("SecondHand - Phone Number updated") String phoneUpdateSubject,
            @DefaultValue("Hello %s,your phone number has been updated. If you did not make this change, please contact us immediately.") String phoneUpdateContent,
            @DefaultValue("SecondHand - Payment Successful") String paymentSuccessSubject,
            @DefaultValue("Hello %s,\nYour payment for the listing titled \"%s\" has been successfully processed.\nPayment Details:\nAmount: %s\nTransaction Type: %s\nThank you for using SecondHand!\nBest regards,\nSecondHand Team") String paymentSuccessContent,
            @DefaultValue("SecondHand - Price changed on a favorite listing") String priceChangeSubject,
            @DefaultValue("Hello %s,\nThe listing \"%s\" at your favorites has changed price from %s to %s.\nCheck it out on SecondHand.") String priceChangeContent,
            @DefaultValue("SecondHand - Order Confirmation") String orderConfirmationSubject,
            @DefaultValue("SecondHand - Your Item Has Been Sold!") String saleNotificationSubject,
            @DefaultValue("SecondHand - Payment Verification") String paymentVerificationSubject,
            @DefaultValue("Hello %s, your payment verification code is %s. This code is valid for %d minutes.") String paymentVerificationContent
    ) {
        this.sender = sender;
        this.verificationSubject = verificationSubject;
        this.verificationContent = verificationContent;
        this.welcomeSubject = welcomeSubject;
        this.welcomeContent = welcomeContent;
        this.phoneUpdateSubject = phoneUpdateSubject;
        this.phoneUpdateContent = phoneUpdateContent;
        this.paymentSuccessSubject = paymentSuccessSubject;
        this.paymentSuccessContent = paymentSuccessContent;
        this.priceChangeSubject = priceChangeSubject;
        this.priceChangeContent = priceChangeContent;
        this.orderConfirmationSubject = orderConfirmationSubject;
        this.saleNotificationSubject = saleNotificationSubject;
        this.paymentVerificationSubject = paymentVerificationSubject;
        this.paymentVerificationContent = paymentVerificationContent;
    }
}


