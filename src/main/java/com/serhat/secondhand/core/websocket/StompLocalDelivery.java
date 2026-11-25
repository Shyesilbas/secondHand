package com.serhat.secondhand.core.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.MimeTypeUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Hands an already serialized JSON body to this instance's simple broker without converting it again. */
@Component
@RequiredArgsConstructor
public class StompLocalDelivery {

    private final SimpMessagingTemplate messagingTemplate;

    public void deliver(String destination, String payloadJson) {
        messagingTemplate.convertAndSend(destination, payloadJson.getBytes(StandardCharsets.UTF_8),
                Map.of(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.APPLICATION_JSON));
    }
}
