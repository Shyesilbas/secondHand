package com.serhat.secondhand.email.config;

import lombok.Getter;
import org.springframework.stereotype.Component;

@Getter
@Component
public class EmailConfig {

    private final String sender;

    private final String verificationSubject;
    private final String verificationContent;

    private final String paymentTermContent;

    private final String termsOfServiceContent;
    private final String termsOfServiceSubject;

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

    public EmailConfig() {
        this.sender = "secondhand@noreply.com";

        this.verificationSubject = "SecondHand - Account Verification Code";
        this.verificationContent = "Hello %s,Please use the following code to verify your SecondHand account: Verification Code: %s This code is valid for 15 minutes.If you did not request this verification, please ignore this email. Best regards, SecondHand Team";

        this.termsOfServiceContent = "Welcome to SecondHand! By using our platform, you agree to the following terms of service: \\n\\n1. You must be at least 18 years old to create an account.\\n2. You are responsible for maintaining the confidentiality of your account credentials.\\n3. All items listed must comply with our prohibited items policy.\\n4. Payments and transactions are subject to our platform rules.\\n5. SecondHand is not liable for any disputes between users.\\n6. We may update these terms at any time; continued use of the platform constitutes acceptance of the updated terms.\\n\\nThank you for using SecondHand!";
        this.termsOfServiceSubject = "Hello %s,Please use the following code to verify your SecondHand account: Verification Code: %s This code is valid for 15 minutes.If you did not request this verification, please ignore this email. Best regards, SecondHand Team";

        this.welcomeSubject = "Welcome to SecondHand!";
        this.welcomeContent = "Hello %s,Welcome to SecondHand! Your account has been successfully created. You can now: Sell your second-hand items Purchase items you like Communicate safely with other users Happy shopping! SecondHand Team";

        this.phoneUpdateSubject = "SecondHand - Phone Number updated";
        this.phoneUpdateContent = "Hello %s,your phone number has been updated. If you did not make this change, please contact us immediately.";


        this.paymentTermContent = "\n1. All payment transactions are secured with SSL encryption.\\n2. Your credit card details are stored in an encrypted format and never shared with third parties.\\n3. Additional security measures (such as 3D Secure) may be required during the payment process.\\n4. If a payment fails, the transaction will be canceled and no charges will be applied.\\n5. Refunds are processed within 5?7 business days.\\n6. The platform is not liable for any technical issues that may occur during payment processing.\\n7. By proceeding with the payment, you acknowledge and agree to these terms.\n";

        this.paymentSuccessSubject = "SecondHand - Payment Successful";
        this.paymentSuccessContent = "Hello %s,\nYour payment for the listing titled \"%s\" has been successfully processed.\nPayment Details:\nAmount: %s\nTransaction Type: %s\nThank you for using SecondHand!\nBest regards,\nSecondHand Team";

        this.priceChangeSubject = "SecondHand - Price changed on a favorite listing";
        this.priceChangeContent = "Hello %s,\nThe listing \"%s\" at your favorites has changed price from %s to %s.\nCheck it out on SecondHand.";

        this.orderConfirmationSubject = "SecondHand - Order Confirmation";
        this.saleNotificationSubject = "SecondHand - Your Item Has Been Sold!";

        this.paymentVerificationSubject = "SecondHand - Payment Verification";
        this.paymentVerificationContent = "Hello %s, your payment verification code is %s. This code is valid for %d minutes.";
    }
}
