package com.serhat.secondhand.core.result;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public final class ResultResponses {

    private ResultResponses() {}

    public static <T> ResponseEntity<?> okOrError(Result<T> result, HttpStatus errorStatus) {
        return okOrError(result, errorStatus, HttpStatus.OK);
    }

    public static <T> ResponseEntity<?> okOrError(Result<T> result, HttpStatus errorStatus, HttpStatus successStatus) {
        if (result.isError()) {
            String code = result.getErrorCode() != null ? result.getErrorCode() : "ERROR";
            String msg = result.getMessage() != null ? result.getMessage() : "An error occurred";
            return ResponseEntity.status(errorStatus).body(Map.of("error", code, "message", msg));
        }
        if (result.getData() == null && successStatus == HttpStatus.OK) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(successStatus).body(result.getData());
    }
}
