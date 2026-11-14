package com.serhat.secondhand.core.result;

import com.serhat.secondhand.core.exception.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for converting {@link Result} objects to strongly-typed {@link ResponseEntity} instances.
 * Failed results throw {@link ResultFailureException}, which {@code GlobalExceptionHandler} renders
 * with the {@code {"error": CODE, "message": ...}} Track A contract so controllers declare concrete
 * {@code ResponseEntity<T>} return types without losing status/body fidelity.
 */
public final class ResultResponses {

    private ResultResponses() {}

    /**
     * Returns 200 OK with data on success. On failure throws {@link ResultFailureException} whose
     * status comes from {@link ErrorCodeStatuses}, falling back to 400 BAD_REQUEST.
     */
    public static <T> ResponseEntity<T> ok(Result<T> result) {
        return of(result, HttpStatus.OK);
    }

    /**
     * Returns 201 CREATED with data on success, or throws {@link ResultFailureException} on failure.
     */
    public static <T> ResponseEntity<T> created(Result<T> result) {
        return of(result, HttpStatus.CREATED);
    }

    /**
     * Returns 204 NO_CONTENT on success, or throws {@link ResultFailureException} on failure.
     */
    public static <T> ResponseEntity<Void> noContent(Result<T> result) {
        if (result.isError()) {
            throw ResultFailureException.from(result, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the given success status with data on success, or throws {@link ResultFailureException}
     * with fallback status 400 BAD_REQUEST on failure.
     */
    public static <T> ResponseEntity<T> of(Result<T> result, HttpStatus successStatus) {
        return ofWithErrorStatus(result, successStatus, HttpStatus.BAD_REQUEST);
    }

    /**
     * Returns the given success status with data on success, or throws {@link ResultFailureException}
     * with the given fallback error status on failure.
     */
    public static <T> ResponseEntity<T> ofWithErrorStatus(Result<T> result, HttpStatus successStatus, HttpStatus errorStatus) {
        if (result.isError()) {
            throw ResultFailureException.from(result, errorStatus);
        }
        if (result.getData() == null) {
            return ResponseEntity.status(successStatus).build();
        }
        return ResponseEntity.status(successStatus).body(result.getData());
    }

    /**
     * Returns 200 OK with a typed body on success, or throws {@link ResultFailureException} on failure.
     */
    public static <T, R> ResponseEntity<R> okWithBody(Result<T> result, R successBody) {
        if (result.isError()) {
            throw ResultFailureException.from(result, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(successBody);
    }

    /**
     * Throws {@link ResultFailureException} if {@code result} failed; otherwise returns its data
     * so controllers can build custom typed responses after failure handling.
     */
    public static <T> T unwrap(Result<T> result) {
        if (result.isError()) {
            throw ResultFailureException.from(result, HttpStatus.BAD_REQUEST);
        }
        return result.getData();
    }

    /**
     * Creates a {@link ResultFailureException} directly from an {@link ErrorCode}.
     */
    public static ResultFailureException fail(ErrorCode errorCode) {
        return ResultFailureException.of(errorCode);
    }

    /**
     * @deprecated Use {@link #ofWithErrorStatus(Result, HttpStatus, HttpStatus)} with explicit statuses.
     */
    @Deprecated(since = "1.1", forRemoval = true)
    public static <T> ResponseEntity<T> okOrError(Result<T> result, HttpStatus errorStatus) {
        return ofWithErrorStatus(result, HttpStatus.OK, errorStatus);
    }

    /**
     * @deprecated Use {@link #ofWithErrorStatus(Result, HttpStatus, HttpStatus)} with explicit statuses.
     */
    @Deprecated(since = "1.1", forRemoval = true)
    public static <T> ResponseEntity<T> okOrError(Result<T> result, HttpStatus errorStatus, HttpStatus successStatus) {
        return ofWithErrorStatus(result, successStatus, errorStatus);
    }
}
