package com.serhat.secondhand.listing.application.common;

import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.AnnotationCacheOperationSource;
import org.springframework.cache.interceptor.CacheEvictOperation;
import org.springframework.cache.interceptor.CacheOperation;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Status, quantity and price changes must clear the cached My Listings pages; otherwise the seller keeps
 * seeing the old status (for example INACTIVE after a batch reactivate) until the cache entry expires.
 */
class ListingCommandServiceCacheEvictionTest {

    private final AnnotationCacheOperationSource source = new AnnotationCacheOperationSource();

    @Test
    void everyEvictingMutationClearsTheUserListingsCache() {
        List<Method> evicting = java.util.Arrays.stream(ListingCommandService.class.getDeclaredMethods())
                .filter(method -> Modifier.isPublic(method.getModifiers()))
                .filter(method -> operations(method).stream().anyMatch(CacheEvictOperation.class::isInstance))
                .toList();

        assertThat(evicting).extracting(Method::getName)
                .contains("publish", "reactivate", "deactivate", "markAsSold", "updateBatchStatus", "deleteListing",
                        "reactivateAllInactive", "deactivateAllActive");
        for (Method method : evicting) {
            assertThat(operations(method))
                    .as(method.getName())
                    .anySatisfy(op -> assertThat(op.getCacheNames()).contains("listing:userListings"));
        }
    }

    private Collection<CacheOperation> operations(Method method) {
        Collection<CacheOperation> ops = source.getCacheOperations(method, ListingCommandService.class);
        return ops == null ? List.of() : ops;
    }
}
