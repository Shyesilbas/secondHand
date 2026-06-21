package com.serhat.secondhand.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.serhat.secondhand.core.config.CloudinaryConfigProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class CloudinaryConfig {

    private final CloudinaryConfigProperties cloudinaryConfigProperties;

    @Bean
    public Cloudinary cloudinary() {
        log.info("Cloudinary Config - Cloud Name: {}", (cloudinaryConfigProperties.getCloudName() != null ? "SET" : "NULL"));
        log.info("Cloudinary Config - API Key: {}", (cloudinaryConfigProperties.getApiKey() != null ? "SET" : "NULL"));
        log.info("Cloudinary Config - API Secret: {}", (cloudinaryConfigProperties.getApiSecret() != null ? "SET" : "NULL"));
        
        return new Cloudinary(ObjectUtils.asMap(

                "cloud_name", cloudinaryConfigProperties.getCloudName(),
                "api_key", cloudinaryConfigProperties.getApiKey(),
                "api_secret", cloudinaryConfigProperties.getApiSecret()
        ));
    }

}
