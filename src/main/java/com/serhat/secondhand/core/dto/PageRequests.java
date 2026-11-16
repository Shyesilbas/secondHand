package com.serhat.secondhand.core.dto;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

/**
 * Builds a {@link PageRequest} from raw {@code page}/{@code size} request parameters. A client-chosen size is
 * clamped to {@link #MAX_PAGE_SIZE} so one request cannot load and enrich a whole table. Endpoints that take a
 * {@code Pageable} parameter get the same cap from {@code spring.data.web.pageable.max-page-size}.
 */
public final class PageRequests {

    public static final int MAX_PAGE_SIZE = 100;

    private PageRequests() {
    }

    public static int clampSize(int size) {
        return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    }

    public static PageRequest of(int page, int size) {
        return PageRequest.of(Math.max(page, 0), clampSize(size));
    }

    public static PageRequest of(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), clampSize(size), sort);
    }
}
