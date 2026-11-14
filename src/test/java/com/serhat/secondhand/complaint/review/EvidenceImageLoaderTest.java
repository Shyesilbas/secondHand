package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EvidenceImageLoaderTest {

    private static final String URL = "https://res.cloudinary.com/demo/image/upload/a.png";

    private final ComplaintModerationProperties properties = new ComplaintModerationProperties();
    private final HttpClient http = mock(HttpClient.class);
    private final EvidenceImageLoader loader = new EvidenceImageLoader(properties, http);

    @SuppressWarnings("unchecked")
    private void answer(int status, String contentType, byte[] body) throws Exception {
        HttpResponse<InputStream> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(status);
        when(response.headers()).thenReturn(HttpHeaders.of(
                contentType == null ? Map.of() : Map.of("Content-Type", List.of(contentType)), (a, b) -> true));
        when(response.body()).thenReturn(new ByteArrayInputStream(body));
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn((HttpResponse) response);
    }

    @Test
    void imageIsAttached() throws Exception {
        answer(200, "image/png; charset=binary", new byte[]{1, 2, 3});

        var loaded = loader.load(List.of(URL));

        assertThat(loaded.attached()).hasSize(1);
        assertThat(loaded.attached().get(0).number()).isEqualTo(1);
        assertThat(loaded.images().get(0).mimeType()).isEqualTo("image/png");
        assertThat(loaded.images().get(0).bytes()).containsExactly(1, 2, 3);
    }

    @Test
    void foreignHostIsNeverFetched() throws Exception {
        var loaded = loader.load(List.of("https://evil.example/a.png", "http://res.cloudinary.com/a.png"));

        assertThat(loaded.attached()).isEmpty();
        assertThat(loaded.unavailable()).extracting(EvidenceImageLoader.UnavailableImage::number).containsExactly(1, 2);
        verifyNoInteractions(http);
    }

    @Test
    void missingImageIsReportedAsUnavailable() throws Exception {
        answer(404, "text/html", new byte[0]);

        var loaded = loader.load(List.of(URL));

        assertThat(loaded.unavailable()).singleElement().extracting(EvidenceImageLoader.UnavailableImage::reason)
                .isEqualTo("HTTP 404");
    }

    @Test
    void nonImageIsReportedAsUnavailable() throws Exception {
        answer(200, "text/html", "<html>".getBytes());

        assertThat(loader.load(List.of(URL)).unavailable()).hasSize(1);
    }

    @Test
    void oversizedImageIsReportedAsUnavailable() throws Exception {
        properties.getReview().setEvidenceImageMaxBytes(2);
        answer(200, "image/jpeg", new byte[]{1, 2, 3});

        assertThat(loader.load(List.of(URL)).unavailable()).singleElement()
                .extracting(EvidenceImageLoader.UnavailableImage::reason).isEqualTo("larger than 2 bytes");
    }

    @Test
    void serverErrorIsTransient() throws Exception {
        answer(503, "text/plain", new byte[0]);

        assertThatThrownBy(() -> loader.load(List.of(URL)))
                .isInstanceOf(EvidenceImageLoader.EvidenceUnavailableException.class);
    }

    @Test
    void networkErrorIsTransient() throws Exception {
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenThrow(new IOException("reset"));

        assertThatThrownBy(() -> loader.load(List.of(URL)))
                .isInstanceOf(EvidenceImageLoader.EvidenceUnavailableException.class);
    }
}
