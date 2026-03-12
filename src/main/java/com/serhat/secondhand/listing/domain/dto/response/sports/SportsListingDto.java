package com.serhat.secondhand.listing.domain.dto.response.sports;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SportsListingDto extends ListingDto {
    private LookupDto discipline;
    private LookupDto equipmentType;
    private LookupDto condition;
}
