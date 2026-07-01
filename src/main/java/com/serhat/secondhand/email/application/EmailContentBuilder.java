package com.serhat.secondhand.email.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.email.application.event.EmailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailContentBuilder {

    private final EmailTemplateService templateService;
    private final ObjectMapper objectMapper;

    public <T> String buildContent(EmailEvent<T> event) {
        String templatePath = event.getTemplatePath();
        Map<String, Object> variables = new HashMap<>();

        if (event.getData() != null) {
            try {
                variables = objectMapper.convertValue(event.getData(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Failed to map event data to template variables for event: {}", event.getClass().getSimpleName(), e);
            }
        }

        return templateService.render(templatePath, variables);
    }
}
