package com.serhat.secondhand.agreements.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AgreementSchemaStartupRunner implements ApplicationRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        if (!isPostgreSql()) {
            return;
        }

        try {
            jdbcTemplate.execute("ALTER TABLE agreements ALTER COLUMN content TYPE TEXT");
            log.info("Ensured agreements.content column uses TEXT type.");
        } catch (Exception ex) {
            // Do not block startup if schema is already compatible or table not created yet.
            log.warn("Could not ensure agreements.content TEXT type: {}", ex.getMessage());
        }
    }

    private boolean isPostgreSql() {
        try (Connection connection = dataSource.getConnection()) {
            String productName = connection.getMetaData().getDatabaseProductName();
            return productName != null && productName.toLowerCase().contains("postgresql");
        } catch (Exception ex) {
            log.warn("Database vendor detection failed: {}", ex.getMessage());
            return false;
        }
    }
}

