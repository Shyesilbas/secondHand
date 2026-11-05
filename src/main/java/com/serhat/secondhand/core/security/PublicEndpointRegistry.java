package com.serhat.secondhand.core.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Discovers all controller methods/classes annotated with {@link PublicEndpoint}
 * and caches the result on application startup.
 * <p>
 * Two views are exposed:
 * <ul>
 *   <li>{@link #getRoutes()}: every controller route (HTTP method + path pattern) with a public
 *       flag. {@link PublicRouteRequestMatcher} picks the route Spring MVC would pick for a request
 *       and permits it only when that route is public, so a protected handler is never opened by a
 *       public pattern on the same path (e.g. {@code GET /api/v1/listings/my} next to the public
 *       {@code GET /api/v1/listings/{id}}).</li>
 *   <li>{@link #getPublicEndpoints()}: literal paths without pattern syntax, used by
 *       {@code AuthenticationFilter} to skip JWT parsing.</li>
 * </ul>
 * The cache is populated once via {@link ApplicationReadyEvent}, so subsequent calls are O(1)
 * and safe for use inside per-request filter chains.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PublicEndpointRegistry {

    /**
     * A controller handler mapping. {@code method} is {@code null} when the mapping declares no HTTP
     * method (it then answers every method).
     */
    public record Route(HttpMethod method, String pattern, boolean isPublic) {
    }

    private record Snapshot(Set<String> directPaths, Set<Route> routes) {
    }

    private final RequestMappingHandlerMapping requestMappingHandlerMapping;

    /** Immutable cache — populated on {@link ApplicationReadyEvent}. */
    private volatile Snapshot cached;

    // ── Lifecycle ────────────────────────────────────────────────────────────

    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        this.cached = compute();
        log.info("PublicEndpointRegistry warmed up — {} routes ({} public, {} public literal paths) cached",
                cached.routes().size(), cached.routes().stream().filter(Route::isPublic).count(),
                cached.directPaths().size());
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Returns the literal (pattern-free) paths of public endpoints.
     * Falls back to a live scan if called before {@link ApplicationReadyEvent}.
     */
    public Set<String> getPublicEndpoints() {
        return snapshot().directPaths();
    }

    /**
     * Returns every controller route, public and protected.
     * Falls back to a live scan if called before {@link ApplicationReadyEvent}.
     */
    public Set<Route> getRoutes() {
        return snapshot().routes();
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private Snapshot snapshot() {
        Snapshot current = cached;
        if (current != null) {
            return current;
        }
        log.warn("PublicEndpointRegistry cache not yet warmed — performing live scan");
        return compute();
    }

    private Snapshot compute() {
        Set<String> directPaths = new HashSet<>();
        Set<Route> routes = new HashSet<>();
        Map<RequestMappingInfo, HandlerMethod> handlerMethods =
                requestMappingHandlerMapping.getHandlerMethods();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo mappingInfo = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();

            boolean isPublicClass = AnnotationUtils.findAnnotation(
                    handlerMethod.getBeanType(), PublicEndpoint.class) != null;
            boolean isPublicMethod = handlerMethod.hasMethodAnnotation(PublicEndpoint.class);
            boolean isPublic = isPublicClass || isPublicMethod;
            if (isPublic) {
                directPaths.addAll(mappingInfo.getDirectPaths());
            }

            Set<RequestMethod> methods = mappingInfo.getMethodsCondition().getMethods();
            for (String pattern : mappingInfo.getPatternValues()) {
                if (methods.isEmpty()) {
                    routes.add(new Route(null, pattern, isPublic));
                } else {
                    for (RequestMethod method : methods) {
                        routes.add(new Route(method.asHttpMethod(), pattern, isPublic));
                    }
                }
            }
        }

        log.debug("Discovered {} controller routes", routes.size());
        return new Snapshot(Collections.unmodifiableSet(directPaths), Collections.unmodifiableSet(routes));
    }
}
