package com.serhat.secondhand.user.domain.dto;

import lombok.Builder;

/** Home / discovery için public satıcı kartı — PII içermeden isim görünümü. */
@Builder
public record GreatSellerPublicProfileDto(Long id, String name, String surname) {
}
