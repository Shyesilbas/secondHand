package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.ai.application.GeminiClient.InlineImage;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Downloads complaint evidence images for Aura. Runs outside any transaction. Only https URLs on the
 * configured evidence host are fetched and redirects are not followed, so a stored URL cannot be used to
 * reach other hosts. A permanent problem (missing image, wrong type, too large) is reported to Aura as an
 * unavailable image; a transient one (timeout, 5xx, network) throws, and the review is retried later.
 */
@Component
@Slf4j
public class EvidenceImageLoader {

    static final Set<String> SUPPORTED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/heic", "image/heif");

    private final ComplaintModerationProperties properties;
    private final HttpClient httpClient;

    @Autowired
    public EvidenceImageLoader(ComplaintModerationProperties properties) {
        this(properties, HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(properties.getReview().getEvidenceImageTimeout())
                .build());
    }

    EvidenceImageLoader(ComplaintModerationProperties properties, HttpClient httpClient) {
        this.properties = properties;
        this.httpClient = httpClient;
    }

    public LoadedEvidence load(List<String> urls) {
        List<AttachedImage> attached = new ArrayList<>();
        List<UnavailableImage> unavailable = new ArrayList<>();
        for (int i = 0; i < urls.size(); i++) {
            int number = i + 1;
            Object outcome = loadOne(urls.get(i));
            if (outcome instanceof InlineImage image) {
                attached.add(new AttachedImage(number, image));
            } else {
                unavailable.add(new UnavailableImage(number, (String) outcome));
            }
        }
        return new LoadedEvidence(attached, unavailable);
    }

    /** Returns an {@link InlineImage}, or the reason the image is permanently unavailable. */
    private Object loadOne(String url) {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException e) {
            return "invalid URL";
        }
        if (!"https".equals(uri.getScheme()) || !properties.getEvidenceImageHost().equalsIgnoreCase(uri.getHost())) {
            return "not on the evidence host";
        }
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(properties.getReview().getEvidenceImageTimeout())
                .GET()
                .build();
        HttpResponse<InputStream> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        } catch (IOException e) {
            throw new EvidenceUnavailableException("Evidence image download failed: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new EvidenceUnavailableException("Evidence image download interrupted", e);
        }
        try (InputStream body = response.body()) {
            int status = response.statusCode();
            if (status >= 500 || status == 429) {
                throw new EvidenceUnavailableException("Evidence host answered " + status, null);
            }
            if (status != 200) {
                return "HTTP " + status;
            }
            String type = response.headers().firstValue("Content-Type")
                    .map(v -> v.split(";", 2)[0].trim().toLowerCase(Locale.ROOT))
                    .orElse("");
            if (!SUPPORTED_TYPES.contains(type)) {
                return "unsupported type " + (type.isEmpty() ? "unknown" : type);
            }
            long max = properties.getReview().getEvidenceImageMaxBytes();
            byte[] bytes = body.readNBytes((int) Math.min(Integer.MAX_VALUE - 1L, max + 1));
            if (bytes.length > max) {
                return "larger than " + max + " bytes";
            }
            if (bytes.length == 0) {
                return "empty";
            }
            return new InlineImage(type, bytes);
        } catch (IOException e) {
            throw new EvidenceUnavailableException("Evidence image read failed: " + e.getMessage(), e);
        }
    }

    public record AttachedImage(int number, InlineImage image) {}

    public record UnavailableImage(int number, String reason) {}

    public record LoadedEvidence(List<AttachedImage> attached, List<UnavailableImage> unavailable) {
        public static LoadedEvidence none() {
            return new LoadedEvidence(List.of(), List.of());
        }

        public List<InlineImage> images() {
            return attached.stream().map(AttachedImage::image).toList();
        }
    }

    public static class EvidenceUnavailableException extends RuntimeException {
        public EvidenceUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
