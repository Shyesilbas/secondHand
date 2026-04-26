package com.serhat.secondhand.core.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PublicEndpointRegistry {

    private final RequestMappingHandlerMapping requestMappingHandlerMapping;

    public Set<String> getPublicEndpoints() {
        Set<String> publicEndpoints = new HashSet<>();
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping.getHandlerMethods();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo mappingInfo = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();

            boolean isPublicClass = AnnotationUtils.findAnnotation(handlerMethod.getBeanType(), PublicEndpoint.class) != null;
            boolean isPublicMethod = handlerMethod.hasMethodAnnotation(PublicEndpoint.class);

            if (isPublicClass || isPublicMethod) {
                if (mappingInfo.getDirectPaths() != null) {
                    publicEndpoints.addAll(mappingInfo.getDirectPaths());
                } else if (mappingInfo.getPatternsCondition() != null) {
                    publicEndpoints.addAll(mappingInfo.getPatternsCondition().getPatterns());
                }
            }
        }

        log.info("Discovered {} public endpoints via @PublicEndpoint annotation", publicEndpoints.size());
        return publicEndpoints;
    }
}
