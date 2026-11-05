package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.LoginAttemptService;
import com.serhat.secondhand.auth.application.LoginService;
import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LoginServiceRefreshTest {

    private static final String REFRESH = "refresh-token";
    private static final String EMAIL = "a@b.com";

    private final IUserService userService = mock(IUserService.class);
    private final TokenService tokenService = mock(TokenService.class);
    private final JwtUtils jwtUtils = mock(JwtUtils.class);
    private LoginService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new LoginService(mock(AuthenticationManager.class), userService, tokenService, jwtUtils,
                mock(LoginAttemptService.class));
        user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);
        when(jwtUtils.extractUsername(REFRESH)).thenReturn(EMAIL);
        when(userService.findByEmail(EMAIL)).thenReturn(Result.success(user));
        when(jwtUtils.isTokenValid(REFRESH, user)).thenReturn(true);
        when(tokenService.isTokenValid(REFRESH)).thenReturn(true);
        when(tokenService.findByToken(REFRESH)).thenReturn(Optional.of(new Token()));
    }

    @Test
    void refresh_forBlockedAccount_isRejectedWithoutIssuingTokens() {
        user.setAccountStatus(AccountStatus.BLOCKED);

        assertThatThrownBy(() -> service.refreshToken(REFRESH))
                .isInstanceOf(AccountNotActiveException.class);
        verify(jwtUtils, never()).generateAccessToken(any());
        verify(tokenService, never()).saveToken(any(), any(), any(), any(), any(), anyBoolean());
        verify(tokenService, never()).revokeToken(any());
    }

    @Test
    void refresh_forActiveAccount_rotatesTokens() {
        user.setAccountStatus(AccountStatus.ACTIVE);
        when(jwtUtils.generateAccessToken(user)).thenReturn("access");
        when(jwtUtils.generateRefreshToken(user, false)).thenReturn("new-refresh");

        when(tokenService.claimForRotation(any())).thenReturn(true);

        assertThat(service.refreshToken(REFRESH).getAccessToken()).isEqualTo("access");
        verify(tokenService).claimForRotation(any());
        verify(tokenService).saveToken(any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void refresh_losingConcurrentRotation_isRejectedWithoutIssuingTokens() {
        user.setAccountStatus(AccountStatus.ACTIVE);
        when(tokenService.claimForRotation(any())).thenReturn(false);

        assertThatThrownBy(() -> service.refreshToken(REFRESH))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(jwtUtils, never()).generateAccessToken(any());
        verify(tokenService, never()).saveToken(any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void refresh_tokenFamilyRevocation_isNotRolledBackByInvalidRefreshTokenException() throws NoSuchMethodException {
        Transactional transactional = LoginService.class.getMethod("refreshToken", String.class)
                .getAnnotation(Transactional.class);

        assertThat(transactional.noRollbackFor()).contains(InvalidRefreshTokenException.class);
    }
}
