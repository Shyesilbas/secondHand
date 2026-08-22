package com.serhat.secondhand.email.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.email")
public class EmailConfig {

    private boolean mock = true;
    private String sender = "secondhand@noreply.com";

    @Autowired
    private MessageSource messageSource;

    public String getSubject(String code, Object... args) {
        Locale locale = LocaleContextHolder.getLocale();
        if (messageSource == null) {
            return "SecondHand Notification";
        }
        return messageSource.getMessage(code, args, "SecondHand Notification", locale);
    }

    public String getVerificationSubject() {
        return getSubject("email.subject.verification");
    }

    public String getPasswordResetSubject() {
        return getSubject("email.subject.password-reset");
    }

    public String getWelcomeSubject() {
        return getSubject("email.subject.welcome");
    }

    public String getPhoneUpdateSubject() {
        return getSubject("email.subject.phone-update");
    }

    public String getPaymentSuccessSubject() {
        return getSubject("email.subject.payment-success");
    }

    public String getPriceChangeSubject() {
        return getSubject("email.subject.price-change");
    }

    public String getOrderConfirmationSubject() {
        return getSubject("email.subject.order-confirmation");
    }

    public String getSaleNotificationSubject() {
        return getSubject("email.subject.sale-notification");
    }

    public String getPaymentVerificationSubject() {
        return getSubject("email.subject.payment-verification");
    }

    public String getGreatSellerSubject() {
        return getSubject("email.subject.great-seller");
    }

    private Agreement agreement = new Agreement();
    private Order order = new Order();
    private Offer offer = new Offer();
    private Follow follow = new Follow();

    @Getter
    @Setter
    public class Agreement {
        public String getSubjectPrefix() {
            return getSubject("email.subject.agreement-prefix");
        }
    }

    @Getter
    @Setter
    public class Order {
        public String getCancelledSubject() {
            return getSubject("email.subject.order-cancelled");
        }
        public String getCompletedSubject() {
            return getSubject("email.subject.order-completed");
        }
        public String getRefundedSubject() {
            return getSubject("email.subject.order-refunded");
        }
    }

    @Getter
    @Setter
    public class Offer {
        public String getReceivedSubject() {
            return getSubject("email.subject.offer-received");
        }
        public String getCounterReceivedSubject() {
            return getSubject("email.subject.offer-counter");
        }
        public String getAcceptedSubject() {
            return getSubject("email.subject.offer-accepted");
        }
        public String getRejectedSubject() {
            return getSubject("email.subject.offer-rejected");
        }
        public String getExpiredSubject() {
            return getSubject("email.subject.offer-expired");
        }
        public String getCompletedSubject() {
            return getSubject("email.subject.offer-completed");
        }
    }

    @Getter
    @Setter
    public class Follow {
        public String getNewListingSubject(String firstName, String lastName) {
            return getSubject("email.subject.new-listing", firstName, lastName);
        }
        public String getNewListingSubjectFormat() {
            return "%s %s yeni bir ilan ekledi!";
        }
    }
}

