package com.serhat.secondhand.core.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.connection.DefaultMessage;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class StompFanoutTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private final StompLocalDelivery local = mock(StompLocalDelivery.class);
    private final StompFanoutPublisher publisher = new StompFanoutPublisher(redis, objectMapper, local);
    private final StompFanoutListener listener = new StompFanoutListener(objectMapper, local);

    @Test
    void publishGoesThroughRedisSoEveryInstanceDeliversIt() throws Exception {
        publisher.send("/topic/chat/9", Map.of("content", "hi"));

        ArgumentCaptor<String> envelope = ArgumentCaptor.forClass(String.class);
        verify(redis).convertAndSend(eq(StompFanoutPublisher.CHANNEL), envelope.capture());
        verifyNoInteractions(local);

        listener.onMessage(new DefaultMessage(StompFanoutPublisher.CHANNEL.getBytes(StandardCharsets.UTF_8),
                envelope.getValue().getBytes(StandardCharsets.UTF_8)), null);

        verify(local).deliver("/topic/chat/9", "{\"content\":\"hi\"}");
    }

    @Test
    void redisOutageStillDeliversToThisInstance() {
        when(redis.convertAndSend(anyString(), anyString())).thenThrow(new RedisConnectionFailureException("down"));

        publisher.send("/user/5/notifications", Map.of("id", 1));

        verify(local).deliver("/user/5/notifications", "{\"id\":1}");
    }

    @Test
    void malformedFanoutMessageIsDropped() {
        listener.onMessage(new DefaultMessage(new byte[0], "{}".getBytes(StandardCharsets.UTF_8)), null);

        verifyNoInteractions(local);
        assertThat(StompFanoutPublisher.CHANNEL).startsWith("v4:");
    }
}
