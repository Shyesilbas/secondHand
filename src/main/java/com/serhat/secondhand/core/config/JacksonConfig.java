package com.serhat.secondhand.core.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer hibernateModuleCustomizer() {
        return builder -> {
            Hibernate6Module module = new Hibernate6Module();
            module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
            builder.modulesToInstall(module);
        };
    }
}
