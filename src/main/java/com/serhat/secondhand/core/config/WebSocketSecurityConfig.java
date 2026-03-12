package com.serhat.secondhand.core.config;

import com.serhat.secondhand.core.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Map;

/**
 * WebSocket message-level security configuration.
 * Authenticates WebSocket connections using JWT tokens.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = extractToken(accessor);

                    if (token != null) {
                        try {
                            String username = jwtUtils.extractUsername(token);
                            
                            if (username != null) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                
                                if (jwtUtils.isTokenValid(token, userDetails)) {
                                    UsernamePasswordAuthenticationToken authentication = 
                                        new UsernamePasswordAuthenticationToken(
                                            userDetails, 
                                            null, 
                                            userDetails.getAuthorities()
                                        );
                                    
                                    accessor.setUser(authentication);
                                    log.info("WebSocket authenticated user: {}", username);
                                } else {
                                    log.warn("Invalid JWT token for WebSocket connection");
                                    throw new MessageDeliveryException("Invalid JWT token");
                                }
                            }
                        } catch (MessageDeliveryException e) {
                            throw e;
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                            throw new MessageDeliveryException("WebSocket authentication failed: " + e.getMessage());
                        }
                    } else {
                        log.warn("WebSocket CONNECT without token - session attrs: {}",
                                accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().keySet() : "null");
                    }
                }
                
                return message;
            }
        });
    }

    /**
     * Extracts JWT token from STOMP header first, then falls back to
     * cookie-based token stored during HTTP handshake.
     * This is necessary because HttpOnly cookies cannot be read by JavaScript
     * and therefore cannot be sent as STOMP headers.
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // 1) Try STOMP native header (for non-HttpOnly setups or explicit token passing)
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2) Fall back to cookie token extracted during HTTP handshake
        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
        if (sessionAttrs != null) {
            Object cookieToken = sessionAttrs.get("ws_token");
            if (cookieToken instanceof String token && !token.isBlank()) {
                log.debug("Using token from HTTP handshake cookie");
                return token;
            }
        }

        return null;
    }
}
