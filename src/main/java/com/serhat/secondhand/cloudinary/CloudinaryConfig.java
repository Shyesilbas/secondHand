package com.serhat.secondhand.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.serhat.secondhand.core.config.CloudinaryConfigProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final CloudinaryConfigProperties cloudinaryConfigProperties;

    @Bean
    public Cloudinary cloudinary() {
        System.out.println("Cloudinary Config - Cloud Name: " + (cloudinaryConfigProperties.getCloudName() != null ? "SET" : "NULL"));
        System.out.println("Cloudinary Config - API Key: " + (cloudinaryConfigProperties.getApiKey() != null ? "SET" : "NULL"));
        System.out.println("Cloudinary Config - API Secret: " + (cloudinaryConfigProperties.getApiSecret() != null ? "SET" : "NULL"));
        
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudinaryConfigProperties.getCloudName(),
                "api_key", cloudinaryConfigProperties.getApiKey(),
                "api_secret", cloudinaryConfigProperties.getApiSecret()
        ));
    }

}
