package com.serhat.secondhand.core.exception;

import com.serhat.secondhand.core.result.ResultFailureException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                "Input validation failed",
                request.getRequestURI()
        );
        problem.setProperty("errors", validationErrors);
        log.warn("Validation error: {}", validationErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ProblemDetail> handleOptimisticLock(
            ObjectOptimisticLockingFailureException ex,
            HttpServletRequest request) {
        ProblemDetail problem = createProblem(
                HttpStatus.CONFLICT,
                "CONCURRENT_MODIFICATION",
                "The resource is currently being modified by another process. Please try again.",
                request.getRequestURI()
        );
        log.warn("Optimistic lock failure: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.CONFLICT,
                "Conflict",
                "Data integrity violation",
                request.getRequestURI()
        );

        log.error("Data integrity violation: {}", ex.getRootCause());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.UNAUTHORIZED,
                "Authentication Failed",
                "Invalid email or password",
                request.getRequestURI()
        );

        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.FORBIDDEN,
                "Access Denied",
                "You don't have permission to access this resource",
                request.getRequestURI()
        );

        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusinessException(
            BusinessException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                ex.getHttpStatus(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );

        log.warn("Business exception [{}]: {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(ex.getHttpStatus()).body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        String sanitizedMessage = sanitizeMessage(ex.getMessage());
        
        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                sanitizedMessage,
                request.getRequestURI()
        );

        log.warn("Illegal argument at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request) {

        String sanitizedMessage = sanitizeMessage(ex.getMessage());

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                sanitizedMessage,
                request.getRequestURI()
        );

        log.warn("Illegal state at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        Map<String, String> validationErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String propertyPath = violation.getPropertyPath() != null ? violation.getPropertyPath().toString() : "field";
            validationErrors.put(propertyPath, violation.getMessage());
        }

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                "Constraint validation failed",
                request.getRequestURI()
        );
        problem.setProperty("errors", validationErrors);

        log.warn("Constraint violation at {}: {}", request.getRequestURI(), validationErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ProblemDetail> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Method Not Allowed",
                "Request method '" + ex.getMethod() + "' is not supported",
                request.getRequestURI()
        );

        log.warn("Method not allowed at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(problem);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ProblemDetail> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Unsupported Media Type",
                "Content-Type '" + ex.getContentType() + "' is not supported",
                request.getRequestURI()
        );

        log.warn("Media type not supported at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(problem);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Payload Too Large",
                "Uploaded file exceeds the maximum allowed size",
                request.getRequestURI()
        );

        log.warn("Max upload size exceeded at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(problem);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ProblemDetail> handleNoResourceFound(
            NoResourceFoundException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.NOT_FOUND,
                "Not Found",
                "Resource not found: " + ex.getResourcePath(),
                request.getRequestURI()
        );

        log.debug("Resource not found at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    // Malformed client requests. Without this the generic handler below turns them into 500s.
    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            org.springframework.web.method.annotation.HandlerMethodValidationException.class
    })
    public ResponseEntity<ProblemDetail> handleMalformedRequest(
            Exception ex,
            HttpServletRequest request) {

        String detail;
        if (ex instanceof MissingServletRequestParameterException missing) {
            detail = "Required parameter '" + missing.getParameterName() + "' is missing";
        } else if (ex instanceof MethodArgumentTypeMismatchException mismatch) {
            detail = "Invalid value for parameter '" + mismatch.getName() + "'";
        } else if (ex instanceof org.springframework.web.method.annotation.HandlerMethodValidationException validation) {
            detail = validation.getParameterValidationResults().stream()
                    .findFirst()
                    .map(r -> "Invalid value for parameter '" + r.getMethodParameter().getParameterName() + "'")
                    .orElse("Invalid request parameter");
        } else {
            detail = "Malformed request body";
        }

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                detail,
                request.getRequestURI()
        );

        log.warn("Malformed request at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ProblemDetail> handleSecurityException(
            SecurityException ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.FORBIDDEN,
                "Forbidden",
                ex.getMessage(),
                request.getRequestURI()
        );

        log.warn("Security exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }


    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void handleAsyncRequestNotUsable(AsyncRequestNotUsableException ex) {
        log.debug("Client disconnected before response could be sent: {}", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        ProblemDetail problem = createProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected error occurred",
                request.getRequestURI()
        );

        log.error("Unexpected exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }

    @ExceptionHandler(ResultFailureException.class)
    public ResponseEntity<Map<String, String>> handleResultFailure(ResultFailureException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(Map.of("error", ex.getErrorCode(), "message", ex.getMessage()));
    }

    private ProblemDetail createProblem(HttpStatus status, String title, String detail, String path) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setProperty("message", detail);
        problem.setProperty("error", title);
        problem.setProperty("path", path);
        problem.setProperty("timestamp", LocalDateTime.now());
        return problem;
    }

    private String sanitizeMessage(String message) {
        if (message == null || message.isBlank()) {
            return "Invalid request";
        }
        
        // Sistem detaylarını sızdırabilecek bilgileri temizle
        String sanitized = message;
        
        // SQL, stack trace veya class path bilgisi içeriyorsa generic mesaj dön
        if (message.contains("java.") || 
            message.contains("org.") || 
            message.contains("com.serhat") ||
            message.contains("SQLException") ||
            message.contains("at ") ||
            message.contains("Caused by")) {
            return "Invalid request. Please check your input.";
        }
        
        // Çok uzun mesajları kısalt
        if (sanitized.length() > 200) {
            sanitized = sanitized.substring(0, 200) + "...";
        }
        
        return sanitized;
    }
}
