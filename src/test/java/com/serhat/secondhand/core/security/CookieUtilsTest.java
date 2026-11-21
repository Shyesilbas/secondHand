package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.CookieConfig;
import com.serhat.secondhand.core.config.JwtConfig;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CookieUtilsTest {

    private CookieUtils cookieUtils;

    @BeforeEach
    void setUp() {
        JwtConfig jwtConfig = new JwtConfig();
        JwtConfig.AccessToken accessToken = new JwtConfig.AccessToken();
        accessToken.setExpiration(900_000L);
        JwtConfig.RefreshToken refreshToken = new JwtConfig.RefreshToken();
        refreshToken.setExpiration(604_800_000L);
        refreshToken.setRememberMeExpiration(2_592_000_000L);
        jwtConfig.setAccessToken(accessToken);
        jwtConfig.setRefreshToken(refreshToken);
        cookieUtils = new CookieUtils(new CookieConfig(), jwtConfig);
    }

    @Test
    void refreshTokenCookieIsScopedToAuthEndpoints() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieUtils.setRefreshTokenCookie(response, "refresh-value", false);

        Cookie issued = refreshCookies(response).stream()
                .filter(c -> c.getMaxAge() > 0)
                .findFirst()
                .orElseThrow();
        assertThat(issued.getValue()).isEqualTo("refresh-value");
        assertThat(issued.getPath()).isEqualTo(CookieUtils.REFRESH_TOKEN_COOKIE_PATH);
        assertThat(issued.isHttpOnly()).isTrue();
    }

    @Test
    void issuingRefreshTokenExpiresTheLegacyRootPathCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieUtils.setRefreshTokenCookie(response, "refresh-value", true);

        assertThat(refreshCookies(response))
                .anySatisfy(c -> {
                    assertThat(c.getPath()).isEqualTo(CookieUtils.LEGACY_REFRESH_TOKEN_COOKIE_PATH);
                    assertThat(c.getMaxAge()).isZero();
                });
    }

    @Test
    void accessTokenCookieStaysOnRootPath() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieUtils.setAccessTokenCookie(response, "access-value");

        Cookie access = response.getCookie(CookieUtils.ACCESS_TOKEN_COOKIE);
        assertThat(access).isNotNull();
        assertThat(access.getPath()).isEqualTo("/");
    }

    @Test
    void clearAuthCookiesExpiresRefreshTokenOnBothPaths() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieUtils.clearAuthCookies(response);

        assertThat(refreshCookies(response))
                .allSatisfy(c -> assertThat(c.getMaxAge()).isZero())
                .extracting(Cookie::getPath)
                .containsExactlyInAnyOrder(CookieUtils.REFRESH_TOKEN_COOKIE_PATH,
                        CookieUtils.LEGACY_REFRESH_TOKEN_COOKIE_PATH);
    }

    private static List<Cookie> refreshCookies(MockHttpServletResponse response) {
        return Arrays.stream(response.getCookies())
                .filter(c -> CookieUtils.REFRESH_TOKEN_COOKIE.equals(c.getName()))
                .toList();
    }
}
