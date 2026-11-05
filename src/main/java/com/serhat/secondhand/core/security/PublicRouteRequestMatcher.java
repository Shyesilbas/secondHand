package com.serhat.secondhand.core.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.PathContainer;
import org.springframework.http.server.RequestPath;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.util.ServletRequestPathUtils;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.Collection;
import java.util.List;

/**
 * Matches a request whose handler is a {@link PublicEndpoint}. Among the controller routes that match
 * the request, the winner is chosen the way Spring MVC chooses a handler: the most specific path
 * pattern wins, then a route that names the HTTP method beats one that answers every method. The
 * request matches only when that winner is public, so a protected handler such as
 * {@code GET /api/v1/listings/my} is not opened by a public pattern such as
 * {@code GET /api/v1/listings/{id}}. When a public and a protected route tie, the request does not
 * match (it stays protected).
 */
public final class PublicRouteRequestMatcher implements RequestMatcher {

    private record CompiledRoute(HttpMethod method, PathPattern pattern, boolean isPublic) {
    }

    private final List<CompiledRoute> routes;

    public PublicRouteRequestMatcher(Collection<PublicEndpointRegistry.Route> routes) {
        this.routes = routes.stream()
                .map(route -> new CompiledRoute(route.method(),
                        PathPatternParser.defaultInstance.parse(route.pattern()), route.isPublic()))
                .toList();
    }

    @Override
    public boolean matches(HttpServletRequest request) {
        PathContainer path = pathWithinApplication(request);
        HttpMethod method = HttpMethod.valueOf(request.getMethod());

        CompiledRoute best = null;
        boolean winnerIsPublic = false;
        for (CompiledRoute route : routes) {
            if ((route.method() != null && !route.method().equals(method)) || !route.pattern().matches(path)) {
                continue;
            }
            int order = best == null ? -1 : compareSpecificity(route, best);
            if (order < 0) {
                best = route;
                winnerIsPublic = route.isPublic();
            } else if (order == 0) {
                winnerIsPublic = winnerIsPublic && route.isPublic();
            }
        }
        return winnerIsPublic;
    }

    /** Negative when {@code a} is more specific than {@code b}. */
    private static int compareSpecificity(CompiledRoute a, CompiledRoute b) {
        int byPattern = PathPattern.SPECIFICITY_COMPARATOR.compare(a.pattern(), b.pattern());
        if (byPattern != 0) {
            return byPattern;
        }
        return Boolean.compare(b.method() != null, a.method() != null);
    }

    // Same path derivation as Spring Security's PathPatternRequestMatcher.
    private static PathContainer pathWithinApplication(HttpServletRequest request) {
        RequestPath path;
        if (ServletRequestPathUtils.hasParsedRequestPath(request)) {
            path = ServletRequestPathUtils.getParsedRequestPath(request);
        } else {
            path = ServletRequestPathUtils.parseAndCache(request);
            ServletRequestPathUtils.clearParsedRequestPath(request);
        }
        return path.subPath(path.contextPath().elements().size());
    }

    @Override
    public String toString() {
        return "PublicRouteRequestMatcher[" + routes.size() + " routes]";
    }
}
