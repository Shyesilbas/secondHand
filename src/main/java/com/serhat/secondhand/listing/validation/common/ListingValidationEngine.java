package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ListingValidationEngine {

    private final LocationValidator locationValidator;
    private final ListingLocationPolicy listingLocationPolicy;

    public <T extends Listing> Result<Void> cleanupAndValidate(T listing, List<? extends CategorySpecValidator<T>> validators) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        // Run structural location validation
        Result<Void> locResult = locationValidator.validate(listing);
        if (locResult != null && locResult.isError()) {
            return locResult;
        }

        // Run business category policy validation
        Result<Void> policyResult = listingLocationPolicy.validate(listing);
        if (policyResult != null && policyResult.isError()) {
            return policyResult;
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

        // Run structural location validation
        Result<Void> locResult = locationValidator.validate(listing);
        if (locResult != null && locResult.isError()) {
            String code = locResult.getErrorCode() != null ? locResult.getErrorCode() : "LOCATION_ERROR";
            errors.add(code + "|" + locResult.getMessage());
            return Result.success(errors);
        }

        // Run business category policy validation
        Result<Void> policyResult = listingLocationPolicy.validate(listing);
        if (policyResult != null && policyResult.isError()) {
            String code = policyResult.getErrorCode() != null ? policyResult.getErrorCode() : "LOCATION_POLICY_ERROR";
            errors.add(code + "|" + policyResult.getMessage());
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
