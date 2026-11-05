package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.core.config.JwtConfig;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilsTokenTypeTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[64]);

    private JwtUtils jwtUtils;
    private User user;

    @BeforeEach
    void setUp() {
        JwtConfig config = new JwtConfig();
        config.setSecretKey(SECRET);
        JwtConfig.AccessToken access = new JwtConfig.AccessToken();
        access.setExpiration(60_000);
        JwtConfig.RefreshToken refresh = new JwtConfig.RefreshToken();
        refresh.setExpiration(600_000);
        refresh.setRememberMeExpiration(6_000_000);
        config.setAccessToken(access);
        config.setRefreshToken(refresh);
        jwtUtils = new JwtUtils(config);

        user = User.builder().id(7L).email("user@example.com").role(UserRole.USER).build();
    }

    @Test
    void accessTokenCarriesTypeIssuerAndAudience() {
        Claims claims = jwtUtils.parseClaims(jwtUtils.generateAccessToken(user));

        assertThat(claims.get("typ", String.class)).isEqualTo("access");
        assertThat(claims.getIssuer()).isEqualTo("secondhand");
        assertThat(claims.getAudience()).containsExactly("secondhand-web");
        assertThat(JwtUtils.userIdFrom(claims)).isEqualTo(7L);
    }

    @Test
    void refreshTokenIsNotAcceptedAsAccessToken() {
        String refresh = jwtUtils.generateRefreshToken(user, false);

        assertThat(jwtUtils.extractRefreshTokenSubject(refresh)).isEqualTo("user@example.com");
        assertThatThrownBy(() -> jwtUtils.parseClaims(refresh)).isInstanceOf(JwtException.class);
    }

    @Test
    void accessTokenIsNotAcceptedAsRefreshToken() {
        String access = jwtUtils.generateAccessToken(user);

        assertThatThrownBy(() -> jwtUtils.extractRefreshTokenSubject(access)).isInstanceOf(JwtException.class);
    }

    @Test
    void registrationTokenUsesItsOwnKeyAndIsNeverASessionToken() {
        String registration = jwtUtils.generateOAuthRegistrationToken("new@example.com", "sub-1", "Ada", "Lovelace", null);

        assertThat(jwtUtils.parseOAuthRegistrationToken(registration).get("email", String.class)).isEqualTo("new@example.com");
        assertThatThrownBy(() -> jwtUtils.parseClaims(registration)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> jwtUtils.extractRefreshTokenSubject(registration)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> jwtUtils.parseOAuthRegistrationToken(jwtUtils.generateAccessToken(user)))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void tokenWithoutIssuerOrTypeSignedWithTheSameKeyIsRejected() {
        // Shape of tokens issued before typ/iss/aud existed.
        String legacy = Jwts.builder()
                .subject("user@example.com")
                .claim("userId", 7L)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET)))
                .compact();

        assertThatThrownBy(() -> jwtUtils.parseClaims(legacy)).isInstanceOf(JwtException.class);
    }
}
