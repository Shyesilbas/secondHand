package com.serhat.secondhand.auth.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.serhat.secondhand.user.domain.entity.User;

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
    private String plan;
    private String planExpiry;

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

    /** Plan data the client shows; same values as the access token's plan claims. */
    public LoginResponse withPlan(User user) {
        this.plan = user.getEffectivePlan().name();
        this.planExpiry = user.getExpirationDate() != null ? user.getExpirationDate().toString() : null;
        return this;
    }
}
