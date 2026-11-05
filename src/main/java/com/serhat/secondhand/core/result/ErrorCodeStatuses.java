package com.serhat.secondhand.core.result;

import com.serhat.secondhand.core.exception.ErrorCode;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * HTTP status for every error code declared in an {@link ErrorCode} enum, looked up by the code
 * string. Services often pass errors on as {@code Result.error(message, code)}, which drops the
 * enum, so the status has to be recoverable from the code alone.
 *
 * <p>Loaded once on first use. Two enums declaring the same code with different statuses fail
 * the load instead of one silently winning.
 */
final class ErrorCodeStatuses {

    private static final String BASE_PACKAGE = "com.serhat.secondhand";

    private static final Map<String, HttpStatus> BY_CODE = load();

    private ErrorCodeStatuses() {}

    static Optional<HttpStatus> of(String code) {
        return code == null ? Optional.empty() : Optional.ofNullable(BY_CODE.get(code));
    }

    private static Map<String, HttpStatus> load() {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false) {
            @Override
            protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
                return beanDefinition.getMetadata().isIndependent();
            }
        };
        scanner.addIncludeFilter(new AssignableTypeFilter(ErrorCode.class));

        Map<String, HttpStatus> byCode = new HashMap<>();
        Map<String, String> source = new HashMap<>();
        for (BeanDefinition candidate : scanner.findCandidateComponents(BASE_PACKAGE)) {
            Class<?> type;
            try {
                type = Class.forName(candidate.getBeanClassName(), false, ErrorCodeStatuses.class.getClassLoader());
            } catch (ClassNotFoundException e) {
                throw new IllegalStateException("Cannot load error code type " + candidate.getBeanClassName(), e);
            }
            if (!type.isEnum()) continue;
            for (Object constant : type.getEnumConstants()) {
                ErrorCode errorCode = (ErrorCode) constant;
                HttpStatus status = errorCode.getHttpStatus();
                if (status == null) continue;
                HttpStatus previous = byCode.putIfAbsent(errorCode.getCode(), status);
                if (previous != null && previous != status) {
                    throw new IllegalStateException("Error code " + errorCode.getCode() + " is declared as " + previous
                            + " in " + source.get(errorCode.getCode()) + " and as " + status + " in " + type.getName());
                }
                source.putIfAbsent(errorCode.getCode(), type.getName());
            }
        }
        return Map.copyOf(byCode);
    }
}
