package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@ConfigurationProperties(prefix = "app.agreements")
@PropertySource("classpath:agreements.properties")
@Getter
@Setter
public class AgreementConfig {
    private TermsOfService termsOfService;
    private PrivacyPolicy privacyPolicy;
    private Kvkk kvkk;
    private DistanceSelling distanceSelling;
    private PaymentTerms paymentTerms;

    @Getter
    @Setter
    public static class TermsOfService {
        private String content;
    }

    @Getter
    @Setter
    public static class PrivacyPolicy {
        private String content;
    }

    @Getter
    @Setter
    public static class Kvkk {
        private String content;
    }

    @Getter
    @Setter
    public static class DistanceSelling {
        private String content;
    }

    @Getter
    @Setter
    public static class PaymentTerms {
        private String content;
    }
}

