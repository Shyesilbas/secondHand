package com.serhat.secondhand.core.websocket;

/** One fan-out message on {@link StompFanoutPublisher#CHANNEL}: the STOMP destination and the JSON body. */
public record StompFanoutEnvelope(String destination, String payloadJson) {
}
