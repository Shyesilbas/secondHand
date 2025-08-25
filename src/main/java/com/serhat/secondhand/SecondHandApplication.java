package com.serhat.secondhand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SecondHandApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecondHandApplication.class, args);
    }

}
