package com.serhat.secondhand.cart;

import com.serhat.secondhand.cart.application.CartSocialMetricService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartSocialMetricServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SetOperations<String, String> setOperations;

    private CartSocialMetricService cartSocialMetricService;

    @BeforeEach
    void setUp() {
        cartSocialMetricService = new CartSocialMetricService(redisTemplate);
    }

    @Test
    void recordListingAddedToCart_shouldAddUserIdToRedisSetAndSetExpire() {
        UUID listingId = UUID.randomUUID();
        Long userId = 100L;
        String expectedKey = "v4:cart:in_cart_users:" + listingId;

        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        cartSocialMetricService.recordListingAddedToCart(listingId, userId);

        verify(setOperations).add(expectedKey, "100");
        verify(redisTemplate).expire(eq(expectedKey), any(Duration.class));
    }

    @Test
    void recordListingRemovedFromCart_shouldRemoveUserIdFromRedisSet() {
        UUID listingId = UUID.randomUUID();
        Long userId = 100L;
        String expectedKey = "v4:cart:in_cart_users:" + listingId;

        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        cartSocialMetricService.recordListingRemovedFromCart(listingId, userId);

        verify(setOperations).remove(expectedKey, "100");
    }

    @Test
    void recordListingsRemovedFromCart_shouldRemoveUserFromMultipleKeys() {
        UUID listingId1 = UUID.randomUUID();
        UUID listingId2 = UUID.randomUUID();
        Long userId = 100L;

        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        cartSocialMetricService.recordListingsRemovedFromCart(List.of(listingId1, listingId2), userId);

        verify(setOperations).remove("v4:cart:in_cart_users:" + listingId1, "100");
        verify(setOperations).remove("v4:cart:in_cart_users:" + listingId2, "100");
    }

    @Test
    void getInCartCount_shouldReturnSizeFromRedisSet() {
        UUID listingId = UUID.randomUUID();
        String expectedKey = "v4:cart:in_cart_users:" + listingId;

        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.size(expectedKey)).thenReturn(5L);

        int count = cartSocialMetricService.getInCartCount(listingId);

        assertEquals(5, count);
        verify(setOperations).size(expectedKey);
    }
}
