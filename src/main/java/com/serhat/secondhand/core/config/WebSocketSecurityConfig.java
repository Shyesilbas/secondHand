package com.serhat.secondhand.core.config;

import com.serhat.secondhand.core.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

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
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        
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
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    
                                    log.debug("WebSocket authenticated: {}", username);
                                } else {
                                    log.warn("Invalid JWT token for WebSocket connection");
                                }
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                        }
                    } else {
                        log.warn("WebSocket connection attempt without valid Authorization header");
                    }
                }
                
                return message;
            }
        });
    }
}
