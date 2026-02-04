package com.serhat.secondhand.auth.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String message;
    private boolean success;
    private Long userId;
    private String email;
    private String accessToken;
    private String refreshToken;
    private boolean rememberMe;

    public LoginResponse(String message, Long userId, String email, String accessToken, String refreshToken) {
        this(message, userId, email, accessToken, refreshToken, false);
    }

    public LoginResponse(String message, Long userId, String email, String accessToken, String refreshToken, boolean rememberMe) {
        this.message = message;
        this.success = true;
        this.userId = userId;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.rememberMe = rememberMe;
    }
}
