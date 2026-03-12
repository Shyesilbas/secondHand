package com.serhat.secondhand.listing.domain.dto.response.common;

import java.util.UUID;

public record LookupDto(
        UUID id,
        String name,
        String label
) {}

