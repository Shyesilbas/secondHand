package com.serhat.secondhand.campaign.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.campaign")
@Getter
@Setter
public class CampaignConfigProperties {

    private int listDefaultSize = 5;
    private long schedulerDeactivateFixedDelayMs = 600000L;
}

