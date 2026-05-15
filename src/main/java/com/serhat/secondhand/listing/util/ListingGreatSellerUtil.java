package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.user.application.GreatSellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ListingGreatSellerUtil {

    private final GreatSellerService greatSellerService;

    public void enrichWithGreatSeller(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }
        Set<Long> sellerIds = new LinkedHashSet<>();
        for (ListingDto dto : dtos) {
            if (dto != null && dto.getSellerId() != null) {
                sellerIds.add(dto.getSellerId());
            }
        }
        if (sellerIds.isEmpty()) {
            return;
        }
        Map<Long, Boolean> flags = greatSellerService.eligibleFlagsBySellerIds(sellerIds);
        for (ListingDto dto : dtos) {
            if (dto == null || dto.getSellerId() == null) {
                continue;
            }
            dto.setSellerGreatSellerEligible(Boolean.TRUE.equals(flags.get(dto.getSellerId())));
        }
    }

    public void enrichWithGreatSeller(ListingDto dto) {
        if (dto == null || dto.getSellerId() == null) {
            return;
        }
        Map<Long, Boolean> flags = greatSellerService.eligibleFlagsBySellerIds(
                Set.of(Objects.requireNonNull(dto.getSellerId())));
        dto.setSellerGreatSellerEligible(Boolean.TRUE.equals(flags.get(dto.getSellerId())));
    }
}
