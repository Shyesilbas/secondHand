package com.serhat.secondhand.core.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Arrays;
import java.util.Map;

@Configuration
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String TOKEN_ATTR = "ws_token";
    private static final String ACCESS_TOKEN_COOKIE = "sh_at";

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new CookieHandshakeInterceptor());
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue", "/user");
        
        registry.setApplicationDestinationPrefixes("/app");
        
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Extracts JWT from HttpOnly cookie during HTTP handshake
     * and stores it in WebSocket session attributes.
     */
    private static class CookieHandshakeInterceptor implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            if (request instanceof ServletServerHttpRequest servletRequest) {
                HttpServletRequest httpRequest = servletRequest.getServletRequest();
                Cookie[] cookies = httpRequest.getCookies();
                if (cookies != null) {
                    Arrays.stream(cookies)
                            .filter(c -> ACCESS_TOKEN_COOKIE.equals(c.getName()))
                            .map(Cookie::getValue)
                            .filter(v -> v != null && !v.isBlank())
                            .findFirst()
                            .ifPresentOrElse(
                                    token -> {
                                        attributes.put(TOKEN_ATTR, token);
                                        log.info("WebSocket handshake: extracted token from cookie (length={})", token.length());
                                    },
                                    () -> log.warn("WebSocket handshake: sh_at cookie found but empty")
                            );
                } else {
                    log.warn("WebSocket handshake: no cookies in request");
                }
            }
            return true;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
            // no-op
        }
    }
}
