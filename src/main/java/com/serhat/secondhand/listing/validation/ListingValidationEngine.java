package com.serhat.secondhand.listing.validation;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ListingValidationEngine {

    public <T extends Listing> Result<Void> cleanupAndValidate(T listing, List<? extends CategorySpecValidator<T>> validators) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }
        if (validators == null || validators.isEmpty()) {
            return Result.success();
        }

        for (CategorySpecValidator<T> v : validators) {
            if (v != null) {
                v.cleanup(listing);
            }
        }

        for (CategorySpecValidator<T> v : validators) {
            if (v == null) {
                continue;
            }
            Result<Void> r = v.validate(listing);
            if (r != null && r.isError()) {
                return r;
            }
        }

        return Result.success();
    }
}

