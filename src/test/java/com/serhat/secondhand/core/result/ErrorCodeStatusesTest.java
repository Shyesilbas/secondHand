package com.serhat.secondhand.core.result;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ErrorCodeStatusesTest {

    @Test
    void errorCodeStatusesLoadsWithoutDuplicateStatusConflict() {
        // Trigger class loading and scanning of all ErrorCode enums
        Optional<HttpStatus> favoriteListNotFound = ErrorCodeStatuses.of("FAVORITE_LIST_NOT_FOUND");
        assertTrue(favoriteListNotFound.isPresent());
        assertTrue(favoriteListNotFound.get().is4xxClientError());

        Optional<HttpStatus> followNotFound = ErrorCodeStatuses.of("FOLLOW_005");
        assertTrue(followNotFound.isPresent());
        assertTrue(followNotFound.get().is4xxClientError());

        Optional<HttpStatus> nonExistent = ErrorCodeStatuses.of("NON_EXISTENT_CODE_XYZ");
        assertFalse(nonExistent.isPresent());
    }
}
