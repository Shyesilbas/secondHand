package com.serhat.secondhand.core.result;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Utility class for converting {@link Result} objects to {@link ResponseEntity}.
 * Eliminates boilerplate error-handling code in controllers.
 */
public final class ResultResponses {

    private ResultResponses() {}

    /**
     * Returns 200 OK with data on success, or errorStatus with error details on failure.
     */
    public static <T> ResponseEntity<?> ok(Result<T> result) {
        return of(result, HttpStatus.OK);
    }

    /**
     * Returns 201 CREATED with data on success, or 400 BAD_REQUEST with error details on failure.
     */
    public static <T> ResponseEntity<?> created(Result<T> result) {
        return of(result, HttpStatus.CREATED);
    }

    /**
     * Returns 204 NO_CONTENT on success, or 400 BAD_REQUEST with error details on failure.
     */
    public static <T> ResponseEntity<?> noContent(Result<T> result) {
        if (result.isError()) {
            return buildErrorResponse(result, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the given successStatus with data on success, or 400 BAD_REQUEST on failure.
     */
    public static <T> ResponseEntity<?> of(Result<T> result, HttpStatus successStatus) {
        return ofWithErrorStatus(result, successStatus, HttpStatus.BAD_REQUEST);
    }

    /**
     * Returns the given successStatus with data on success, or the given errorStatus on failure.
     */
    public static <T> ResponseEntity<?> ofWithErrorStatus(Result<T> result, HttpStatus successStatus, HttpStatus errorStatus) {
        if (result.isError()) {
            return buildErrorResponse(result, errorStatus);
        }
        if (result.getData() == null) {
            return ResponseEntity.status(successStatus).build();
        }
        return ResponseEntity.status(successStatus).body(result.getData());
    }

    /**
     * Returns 200 OK with custom body on success, or 400 BAD_REQUEST with error details on failure.
     */
    public static <T> ResponseEntity<?> okWithBody(Result<T> result, Object successBody) {
        if (result.isError()) {
            return buildErrorResponse(result, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(successBody);
    }

    // ---- Legacy alias (backward compatibility) ----

    /**
     * @deprecated Use {@link #ok(Result)} or {@link #of(Result, HttpStatus)} instead.
     */
    @Deprecated
    public static <T> ResponseEntity<?> okOrError(Result<T> result, HttpStatus errorStatus) {
        return ofWithErrorStatus(result, HttpStatus.OK, errorStatus);
    }

    /**
     * @deprecated Use {@link #ofWithErrorStatus(Result, HttpStatus, HttpStatus)} instead.
     */
    @Deprecated
    public static <T> ResponseEntity<?> okOrError(Result<T> result, HttpStatus errorStatus, HttpStatus successStatus) {
        return ofWithErrorStatus(result, successStatus, errorStatus);
    }

    // ---- Internal ----

    private static ResponseEntity<?> buildErrorResponse(Result<?> result, HttpStatus status) {
        String code = result.getErrorCode() != null ? result.getErrorCode() : "ERROR";
        String msg = result.getMessage() != null ? result.getMessage() : "An error occurred";
        return ResponseEntity.status(status).body(Map.of("error", code, "message", msg));
    }
}
