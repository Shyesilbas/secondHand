package com.serhat.secondhand.favoritelist.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FavoriteListSummaryProjection {
    Long getId();
    String getName();
    String getDescription();
    boolean getIsPublic();
    String getCoverImageUrl();
    Long getOwnerId();
    String getOwnerName();
    long getItemCount();
    long getLikeCount();
    BigDecimal getTotalPrice();
    String getCurrency();
    String getPreviewImageUrl();
    LocalDateTime getCreatedAt();
}
