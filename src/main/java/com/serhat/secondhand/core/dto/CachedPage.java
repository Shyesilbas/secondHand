package com.serhat.secondhand.core.dto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.io.Serializable;
import java.util.List;

/**
 * A serializable wrapper for Spring Data's Page object.
 * Required because PageImpl does not have a default constructor, making it incompatible with some Redis serializers.
 */
public record CachedPage<T>(List<T> content, long totalElements, int pageNumber, int pageSize) implements Serializable {
    
    public static <T> CachedPage<T> from(Page<T> page) {
        return new CachedPage<>(
            page.getContent(), 
            page.getTotalElements(), 
            page.getNumber(), 
            page.getSize()
        );
    }

    public Page<T> toPage() {
        return new PageImpl<>(content, PageRequest.of(pageNumber, pageSize), totalElements);
    }
}
