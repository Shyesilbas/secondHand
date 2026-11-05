package com.serhat.secondhand.core.result;

import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ResultResponsesStatusTest {

    @Test
    void errorCodeEnumDecidesTheStatus() {
        ResponseEntity<?> notFound = ResultResponses.ok(Result.error(OfferErrorCodes.OFFER_NOT_FOUND));
        ResponseEntity<?> forbidden = ResultResponses.ok(Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED));

        assertThat(notFound.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(notFound.getBody()).isEqualTo(Map.of("error", "OFFER_NOT_FOUND", "message", "Offer not found"));
    }

    @Test
    void statusSurvivesPropagationAsMessageAndCode() {
        Result<Void> original = Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        Result<Void> propagated = Result.error(original.getMessage(), original.getErrorCode());

        assertThat(ResultResponses.noContent(propagated).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(ResultResponses.created(original.propagateError()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void codesNoEnumDeclaresStayBadRequest() {
        assertThat(ResultResponses.ok(Result.error("Something went wrong")).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ResultResponses.ok(Result.error("Seed failed", "SEED_FAILED")).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void everyDeclaredCodeLoadsWithoutConflicts() {
        assertThat(ErrorCodeStatuses.of(AuthErrorCodes.INVALID_OAUTH_REGISTRATION_TOKEN.getCode()))
                .contains(HttpStatus.UNAUTHORIZED);
        assertThat(ErrorCodeStatuses.of(null)).isEmpty();
    }
}
