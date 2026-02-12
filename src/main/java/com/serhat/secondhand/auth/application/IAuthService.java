package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.core.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

import java.util.Map;

public interface IAuthService {
    
    Result<RegisterResponse> register(RegisterRequest request);
    
    LoginResponse login(LoginRequest request);
    
    String logout(String username, String accessToken);
    
    LoginResponse refreshToken(String refreshTokenValue);
    
    Map<String, String> logout(Authentication authentication, HttpServletRequest request);
    
    Map<String, Object> validateToken(Authentication authentication);
    
    LoginResponse completeOAuthRegistration(OAuthCompleteRequest request);
    
    Map<String, String> revokeAllSessions(Authentication authentication, HttpServletRequest request);
}
