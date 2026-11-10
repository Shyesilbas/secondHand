package com.serhat.secondhand.core.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerMalformedRequestTest {

    @RestController
    static class ProbeController {

        @PostMapping("/probe/body")
        String body(@RequestBody Map<String, Object> body) {
            return "ok";
        }

        @GetMapping("/probe/param")
        String param(@RequestParam String query) {
            return query;
        }

        @GetMapping("/probe/{id}")
        String id(@PathVariable UUID id) {
            return id.toString();
        }

        @GetMapping("/probe/illegal-state")
        String illegalState() {
            throw new IllegalStateException("Only pending orders can be confirmed");
        }

        @GetMapping("/probe/upload-limit")
        String uploadLimit() {
            throw new org.springframework.web.multipart.MaxUploadSizeExceededException(1024L);
        }
    }

    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new ProbeController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void malformedJsonBodyReturns400() throws Exception {
        mockMvc.perform(post("/probe/body").contentType(MediaType.APPLICATION_JSON).content("{bad"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Malformed request body"));
    }

    @Test
    void missingRequestParameterReturns400() throws Exception {
        mockMvc.perform(get("/probe/param"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Required parameter 'query' is missing"));
    }

    @Test
    void pathVariableTypeMismatchReturns400() throws Exception {
        mockMvc.perform(get("/probe/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid value for parameter 'id'"))
                .andExpect(jsonPath("$.message").value("Invalid value for parameter 'id'"))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void illegalStateExceptionReturns400WithDetailAndMessage() throws Exception {
        mockMvc.perform(get("/probe/illegal-state"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Only pending orders can be confirmed"))
                .andExpect(jsonPath("$.message").value("Only pending orders can be confirmed"))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void methodNotSupportedReturns405() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/probe/param"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error").value("Method Not Allowed"));
    }

    @Test
    void maxUploadSizeExceededReturns413() throws Exception {
        mockMvc.perform(get("/probe/upload-limit"))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.error").value("Payload Too Large"))
                .andExpect(jsonPath("$.message").value("Uploaded file exceeds the maximum allowed size"));
    }
}
