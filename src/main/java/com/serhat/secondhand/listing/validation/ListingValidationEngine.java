package com.serhat.secondhand.listing.validation;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
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

    public <T extends Listing> Result<List<String>> cleanupAndValidateCollectErrors(
            T listing,
            List<? extends CategorySpecValidator<T>> validators
    ) {
        List<String> errors = new ArrayList<>();

        if (listing == null) {
            errors.add("LISTING_REQUIRED|Listing is required");
            return Result.success(errors);
        }

        if (validators == null || validators.isEmpty()) {
            return Result.success(errors);
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
                String code = r.getErrorCode() != null ? r.getErrorCode() : "VALIDATION_ERROR";
                String message = r.getMessage() != null ? r.getMessage() : "Validation error";
                errors.add(code + "|" + message);
            }
        }

        return Result.success(errors);
    }
}

