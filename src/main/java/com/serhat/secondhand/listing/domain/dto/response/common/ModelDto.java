package com.serhat.secondhand.listing.domain.dto.response.common;

import java.util.UUID;

public record ModelDto(
        UUID id,
        String name,
        LookupDto brand,
        LookupDto type
) {}

