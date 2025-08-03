package com.serhat.secondhand.email.domain.entity.enums;

public enum EmailStatus {
    PENDING,    // Email henüz gönderilmedi
    SENT,       // Email başarıyla gönderildi
    FAILED,     // Email gönderimi başarısız
    DELIVERED,  // Email alıcıya ulaştı
    BOUNCED,    // Email geri döndü
    CANCELLED   // Email gönderimi iptal edildi
}