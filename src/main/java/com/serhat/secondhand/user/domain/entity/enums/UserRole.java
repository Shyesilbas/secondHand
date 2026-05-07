package com.serhat.secondhand.user.domain.entity.enums;

/**
 * Spring Security için kullanıcı rol modeli.
 * Spring Security konvansiyonu gereği authority adı "ROLE_" ön ekiyle yayılır.
 */
public enum UserRole {
    USER,
    ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}
