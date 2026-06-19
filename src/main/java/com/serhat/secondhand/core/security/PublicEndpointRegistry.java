package com.serhat.secondhand.core.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Discovers all controller methods/classes annotated with {@link PublicEndpoint}
 * and caches the resulting path set on application startup.
 * <p>
 * The cache is populated once via {@link ApplicationReadyEvent}, so
 * subsequent calls to {@link #getPublicEndpoints()} are O(1) and safe
 * for use inside per-request filter chains.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PublicEndpointRegistry {

    private final RequestMappingHandlerMapping requestMappingHandlerMapping;

    /** Immutable cache — populated on {@link ApplicationReadyEvent}. */
    private volatile Set<String> cachedPublicEndpoints;

    // ── Lifecycle ────────────────────────────────────────────────────────────

    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        this.cachedPublicEndpoints = Collections.unmodifiableSet(computePublicEndpoints());
        log.info("PublicEndpointRegistry warmed up — {} public endpoints cached",
                cachedPublicEndpoints.size());
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Returns the set of paths that are publicly accessible (no auth required).
     * Returns the cached set after startup; falls back to a live scan if called
     * before {@link ApplicationReadyEvent} (e.g. during context refresh tests).
     */
    public Set<String> getPublicEndpoints() {
        if (cachedPublicEndpoints != null) {
            return cachedPublicEndpoints;
        }
        log.warn("PublicEndpointRegistry cache not yet warmed — performing live scan");
        return computePublicEndpoints();
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private Set<String> computePublicEndpoints() {
        Set<String> publicEndpoints = new HashSet<>();
        Map<RequestMappingInfo, HandlerMethod> handlerMethods =
                requestMappingHandlerMapping.getHandlerMethods();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo mappingInfo = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();

            boolean isPublicClass = AnnotationUtils.findAnnotation(
                    handlerMethod.getBeanType(), PublicEndpoint.class) != null;
            boolean isPublicMethod = handlerMethod.hasMethodAnnotation(PublicEndpoint.class);

            if (isPublicClass || isPublicMethod) {
                if (mappingInfo.getDirectPaths() != null) {
                    publicEndpoints.addAll(mappingInfo.getDirectPaths());
                } else if (mappingInfo.getPatternsCondition() != null) {
                    publicEndpoints.addAll(mappingInfo.getPatternsCondition().getPatterns());
                }
            }
        }

        log.debug("Discovered {} public endpoints via @PublicEndpoint annotation",
                publicEndpoints.size());
        return publicEndpoints;
    }
}

