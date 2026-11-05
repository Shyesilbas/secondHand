package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.security.PublicEndpointRegistry.Route;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PublicRouteRequestMatcherTest {

    private static final String LISTING_ID = "/api/v1/listings/3f2b8c1e-0d4a-4b7e-9a51-6c2d8e9f1a20";

    private final PublicRouteRequestMatcher matcher = new PublicRouteRequestMatcher(List.of(
            new Route(HttpMethod.GET, "/api/v1/listings/{id}", true),
            new Route(HttpMethod.PUT, "/api/v1/listings/{id}", false),
            new Route(HttpMethod.GET, "/api/v1/listings/my", false),
            new Route(HttpMethod.POST, "/api/v1/listings/filter", true)
    ));

    @Test
    void protectedLiteralRouteIsNotOpenedByPublicPattern() {
        assertThat(matcher.matches(request("GET", "/api/v1/listings/my"))).isFalse();
    }

    @Test
    void publicPatternRouteMatches() {
        assertThat(matcher.matches(request("GET", LISTING_ID))).isTrue();
    }

    @Test
    void protectedMethodOnPublicPathDoesNotMatch() {
        assertThat(matcher.matches(request("PUT", LISTING_ID))).isFalse();
    }

    @Test
    void publicLiteralRouteMatches() {
        assertThat(matcher.matches(request("POST", "/api/v1/listings/filter"))).isTrue();
    }

    @Test
    void unknownRouteDoesNotMatch() {
        assertThat(matcher.matches(request("GET", "/api/v1/orders"))).isFalse();
        assertThat(matcher.matches(request("DELETE", "/api/v1/listings/filter"))).isFalse();
    }

    @Test
    void methodSpecificRouteBeatsAnyMethodRouteOnSamePattern() {
        PublicRouteRequestMatcher anyMethodProtected = new PublicRouteRequestMatcher(List.of(
                new Route(null, "/api/v1/things/{id}", false),
                new Route(HttpMethod.GET, "/api/v1/things/{id}", true)
        ));

        assertThat(anyMethodProtected.matches(request("GET", "/api/v1/things/1"))).isTrue();
        assertThat(anyMethodProtected.matches(request("POST", "/api/v1/things/1"))).isFalse();
    }

    @Test
    void tieBetweenPublicAndProtectedRouteStaysProtected() {
        PublicRouteRequestMatcher tied = new PublicRouteRequestMatcher(List.of(
                new Route(HttpMethod.GET, "/a/{x}", true),
                new Route(HttpMethod.GET, "/{y}/b", false)
        ));
        PublicRouteRequestMatcher bothPublic = new PublicRouteRequestMatcher(List.of(
                new Route(HttpMethod.GET, "/a/{x}", true),
                new Route(HttpMethod.GET, "/{y}/b", true)
        ));

        assertThat(tied.matches(request("GET", "/a/b"))).isFalse();
        assertThat(bothPublic.matches(request("GET", "/a/b"))).isTrue();
    }

    private static MockHttpServletRequest request(String method, String uri) {
        return new MockHttpServletRequest(method, uri);
    }
}
