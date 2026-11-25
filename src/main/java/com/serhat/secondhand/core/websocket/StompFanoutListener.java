package com.serhat.secondhand.core.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/** Receives {@link StompFanoutPublisher#CHANNEL} messages and delivers them to clients on this instance. */
@Component
@RequiredArgsConstructor
@Slf4j
public class StompFanoutListener implements MessageListener {

    private final ObjectMapper objectMapper;
    private final StompLocalDelivery localDelivery;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            StompFanoutEnvelope envelope = objectMapper.readValue(
                    new String(message.getBody(), StandardCharsets.UTF_8), StompFanoutEnvelope.class);
            if (envelope.destination() == null || envelope.payloadJson() == null) {
                log.error("Dropping malformed STOMP fan-out message without destination or payload");
                return;
            }
            localDelivery.deliver(envelope.destination(), envelope.payloadJson());
        } catch (Exception e) {
            log.error("Failed to deliver STOMP fan-out message", e);
        }
    }
}
