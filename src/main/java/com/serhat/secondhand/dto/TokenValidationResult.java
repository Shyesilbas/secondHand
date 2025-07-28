package com.serhat.secondhand.dto;

import com.serhat.secondhand.entity.enums.TokenStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenValidationResult {
    
    private boolean valid;
    private TokenStatus status;
    
    public static TokenValidationResult valid() {
        return new TokenValidationResult(true, TokenStatus.ACTIVE);
    }
    
    public static TokenValidationResult revoked() {
        return new TokenValidationResult(false, TokenStatus.REVOKED);
    }
    
    public static TokenValidationResult expired() {
        return new TokenValidationResult(false, TokenStatus.EXPIRED);
    }
    
    public static TokenValidationResult notFound() {
        return new TokenValidationResult(false, null);
    }
} 