package com.serhat.secondhand.favoritelist.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.favorite-list")
@Getter
@Setter
public class FavoriteListConfig {
    private int myListsDefaultSize = 5;
    private int userPublicListsDefaultSize = 5;
    private int popularDefaultSize = 10;
    private int maxListsPerUser = 20;
    private int maxItemsPerList = 100;
}
