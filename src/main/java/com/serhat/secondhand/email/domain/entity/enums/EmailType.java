package com.serhat.secondhand.email.domain.entity.enums;

public enum EmailType {
    VERIFICATION_CODE,     // Hesap doğrulama kodu
    PASSWORD_RESET,        // Şifre sıfırlama
    WELCOME,              // Hoşgeldin emaili
    NOTIFICATION,         // Genel bildirimler
    PROMOTIONAL,          // Promosyon emaili
    SYSTEM                // Sistem emaili
}