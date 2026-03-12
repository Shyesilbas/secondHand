package com.serhat.secondhand.listing.domain.dto.response.common;

import java.util.UUID;

public record BookGenreDto(
        UUID id,
        String name,
        String label,
        LookupDto bookType
) {}

