package com.serhat.secondhand.core.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Sends a STOMP message to every application instance. The in-memory simple broker only reaches clients
 * connected to the instance that sends, so pushes go through the Redis channel {@link #CHANNEL} and each
 * instance's {@link StompFanoutListener} delivers them to its own clients (the sender's instance included).
 * When Redis cannot be reached the message is delivered locally and the failure is logged; the data behind
 * every push is already in PostgreSQL, so only the live push to clients on other instances is lost.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StompFanoutPublisher {

    public static final String CHANNEL = "v4:ws:fanout";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final StompLocalDelivery localDelivery;

    public void send(String destination, Object payload) {
        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("STOMP payload for " + destination + " is not serializable", e);
        }
        try {
            String envelope = objectMapper.writeValueAsString(new StompFanoutEnvelope(destination, payloadJson));
            redisTemplate.convertAndSend(CHANNEL, envelope);
        } catch (RuntimeException | JsonProcessingException e) {
            log.error("STOMP fan-out via Redis failed for {}; delivering to this instance only", destination, e);
            localDelivery.deliver(destination, payloadJson);
        }
    }
}
