package com.serhat.secondhand.dto.response;

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
    
    public LoginResponse(String message, Long userId, String email, String accessToken, String refreshToken) {
        this.message = message;
        this.success = true;
        this.userId = userId;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
