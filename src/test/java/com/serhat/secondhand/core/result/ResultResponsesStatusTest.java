package com.serhat.secondhand.core.result;

import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.exception.GlobalExceptionHandler;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ResultResponsesStatusTest {

    @RestController
    static class ProbeController {

        @GetMapping("/probe/ok")
        ResponseEntity<String> ok() {
            return ResultResponses.ok(Result.success("hello"));
        }

        @GetMapping("/probe/not-found")
        ResponseEntity<String> notFound() {
            return ResultResponses.ok(Result.error(OfferErrorCodes.OFFER_NOT_FOUND));
        }

        @GetMapping("/probe/forbidden")
        ResponseEntity<Void> forbidden() {
            return ResultResponses.noContent(Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED));
        }
    }

    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new ProbeController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void errorCodeEnumDecidesTheStatus() {
        assertThatThrownBy(() -> ResultResponses.ok(Result.error(OfferErrorCodes.OFFER_NOT_FOUND)))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> {
                    ResultFailureException failure = (ResultFailureException) ex;
                    assertThat(failure.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(failure.getErrorCode()).isEqualTo("OFFER_NOT_FOUND");
                    assertThat(failure.getMessage()).isEqualTo("Offer not found");
                });

        assertThatThrownBy(() -> ResultResponses.ok(Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED)))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> assertThat(((ResultFailureException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void globalExceptionHandlerRendersTrackAErrorEnvelope() throws Exception {
        mockMvc.perform(get("/probe/ok"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("hello"));

        mockMvc.perform(get("/probe/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("OFFER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Offer not found"));

        mockMvc.perform(get("/probe/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("OFFER_NOT_ALLOWED"));
    }

    @Test
    void statusSurvivesPropagationAsMessageAndCode() {
        Result<Void> original = Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        Result<Void> propagated = Result.error(original.getMessage(), original.getErrorCode());

        assertThatThrownBy(() -> ResultResponses.noContent(propagated))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> assertThat(((ResultFailureException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));

        assertThatThrownBy(() -> ResultResponses.created(original.propagateError()))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> assertThat(((ResultFailureException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void codesNoEnumDeclaresStayBadRequest() {
        assertThatThrownBy(() -> ResultResponses.ok(Result.error("Something went wrong")))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> assertThat(((ResultFailureException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> ResultResponses.ok(Result.error("Seed failed", "SEED_FAILED")))
                .isInstanceOf(ResultFailureException.class)
                .satisfies(ex -> assertThat(((ResultFailureException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void everyDeclaredCodeLoadsWithoutConflicts() {
        assertThat(ErrorCodeStatuses.of(AuthErrorCodes.INVALID_OAUTH_REGISTRATION_TOKEN.getCode()))
                .contains(HttpStatus.UNAUTHORIZED);
        assertThat(ErrorCodeStatuses.of(null)).isEmpty();
    }
}
