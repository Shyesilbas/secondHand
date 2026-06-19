package com.serhat.secondhand.listing.api.support;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import org.springframework.http.ResponseEntity;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

/**
 * Stateless helper for category-specific listing controllers.
 * <p>
 * Centralises the repetitive "check error → 200, otherwise 201 Created + id body" pattern
 * so that each controller stays focused on routing concerns only.
 */
public final class CategoryListingControllerSupport {

    private CategoryListingControllerSupport() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Builds the standard response for a listing-creation operation.
     * <ul>
     *   <li>On error: returns {@code 200 OK} with the error result body
     *       (consistent with the existing {@link ResultResponses} convention).</li>
     *   <li>On success: returns {@code 201 Created} with a {@code Location} header
     *       pointing at the new resource and a {@code {"id": "<uuid>"}} body.</li>
     * </ul>
     *
     * @param result   the service result carrying a UUID on success
     * @param basePath the base path of the resource collection, e.g. {@code "/api/v1/electronics"}
     * @return an appropriate {@link ResponseEntity}
     */
    public static ResponseEntity<?> buildCreateResponse(Result<UUID> result, String basePath) {
        if (result.isError()) {
            return ResultResponses.ok(result);
        }
        URI location = URI.create(basePath + "/" + result.getData());
        return ResponseEntity.created(location).body(Map.of("id", result.getData()));
    }
}
