package com.serhat.secondhand.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Second Hand Marketplace API")
                        .description("A comprehensive second-hand marketplace platform API with user management, product listings, and transaction support")
                        .version("1.0.0"));
    }

}
