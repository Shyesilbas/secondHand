package com.serhat.secondhand.core.result;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Objects;

/**
 * Unchecked signal thrown by {@link ResultResponses} when converting a failed {@link Result}
 * into an HTTP error response via {@code GlobalExceptionHandler}.
 * Throwing on failure keeps controller signatures strictly typed ({@code ResponseEntity<T>})
 * for OpenAPI schema generation while preserving the Track A {@code {"error": CODE, "message": ...}}
 * JSON contract.
 */
@Getter
public class ResultFailureException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public ResultFailureException(HttpStatus status, String errorCode, String message) {
        super(message != null ? message : "An error occurred");
        this.status = Objects.requireNonNull(status, "status must not be null");
        this.errorCode = errorCode != null ? errorCode : "ERROR";
    }

    public static ResultFailureException from(Result<?> result) {
        return from(result, HttpStatus.BAD_REQUEST);
    }

    public static ResultFailureException from(Result<?> result, HttpStatus fallback) {
        HttpStatus resolvedFallback = fallback != null && fallback.isError() ? fallback : HttpStatus.BAD_REQUEST;
        String code = result.getErrorCode() != null ? result.getErrorCode() : "ERROR";
        String msg = result.getMessage() != null ? result.getMessage() : "An error occurred";
        HttpStatus status = ErrorCodeStatuses.of(result.getErrorCode())
                .filter(HttpStatus::isError)
                .orElse(resolvedFallback);
        return new ResultFailureException(status, code, msg);
    }

    public static ResultFailureException of(ErrorCode errorCode) {
        HttpStatus status = errorCode.getHttpStatus() != null && errorCode.getHttpStatus().isError()
                ? errorCode.getHttpStatus()
                : HttpStatus.BAD_REQUEST;
        return new ResultFailureException(status, errorCode.getCode(), errorCode.getMessage());
    }
}
