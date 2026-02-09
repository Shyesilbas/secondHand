package com.serhat.secondhand.listing.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackViewRequest {
    private String sessionId;
    private String userAgent;
}
