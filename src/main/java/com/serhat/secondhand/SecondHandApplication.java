package com.serhat.secondhand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
        org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
})
@ConfigurationPropertiesScan
@EnableScheduling
@EnableAsync
public class SecondHandApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(SecondHandApplication.class, args);
    }

    private static void loadEnv() {
        try {
            java.io.File file = new java.io.File(".env");
            if (file.exists()) {
                java.nio.file.Files.readAllLines(file.toPath()).forEach(line -> {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        return;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();

                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }

                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                });
            }
        } catch (java.io.IOException e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }

}
