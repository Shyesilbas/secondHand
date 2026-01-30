package com.serhat.secondhand.listing.validation;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;

public interface CategorySpecValidator<T extends Listing> {
    Result<Void> validate(T listing);
    void cleanup(T listing);
}

