package com.serhat.secondhand.core.config;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.domain.entity.User;
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

    private static final String CHAT_TOPIC_PREFIX = "/topic/chat/";
    private static final String BROADCAST_NOTIFICATIONS_TOPIC = "/topic/notifications";
    private static final String USER_DESTINATION_PREFIX = "/user/";
    private static final String APP_DESTINATION_PREFIX = "/app/";

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final ChatAuthorizationService chatAuthorizationService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) {
                    return message;
                }

                StompCommand command = accessor.getCommand();
                if (command == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(command)) {
                    authenticateConnect(accessor);
                    return message;
                }

                // Diğer tüm STOMP komutlarında (SUBSCRIBE/SEND/UNSUBSCRIBE/DISCONNECT) authenticated user zorunludur.
                if (isAuthorizationRequired(command) && accessor.getUser() == null) {
                    log.warn("Rejecting unauthenticated WebSocket {} for destination {}",
                            command, accessor.getDestination());
                    throw new MessageDeliveryException("WebSocket authentication required");
                }

                if (StompCommand.SUBSCRIBE.equals(command)) {
                    authorizeSubscription(accessor);
                }

                if (StompCommand.SEND.equals(command)) {
                    authorizeSend(accessor);
                }

                return message;
            }
        });
    }

    // Abonelik izin listesi: /topic/notifications, katılımcısı olunan /topic/chat/{roomId}
    // ve yalnızca kullanıcının kendi /user/{userId}/... hedefleri. Simple broker abonelik
    // hedeflerini Ant pattern olarak eşlediği için "/user/**" gibi joker karakterler reddedilir.
    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || containsPatternOrTraversal(destination)) {
            log.warn("Rejecting WebSocket SUBSCRIBE to invalid destination {}", destination);
            throw new MessageDeliveryException("Invalid subscription destination");
        }
        if (BROADCAST_NOTIFICATIONS_TOPIC.equals(destination)) {
            return;
        }

        Long userId = currentUserId(accessor);
        if (destination.startsWith(CHAT_TOPIC_PREFIX)) {
            authorizeChatSubscription(destination, userId);
            return;
        }
        if (destination.startsWith(USER_DESTINATION_PREFIX + userId + "/")) {
            return;
        }

        log.warn("Rejecting WebSocket SUBSCRIBE by user {} to destination {}", userId, destination);
        throw new MessageDeliveryException("Subscription destination not allowed");
    }

    // /topic/chat/{roomId} yalnızca oda katılımcılarına açıktır.
    private void authorizeChatSubscription(String destination, Long userId) {
        Long roomId;
        try {
            roomId = Long.valueOf(destination.substring(CHAT_TOPIC_PREFIX.length()));
        } catch (NumberFormatException e) {
            throw new MessageDeliveryException("Invalid chat subscription");
        }
        if (chatAuthorizationService.validateRoomParticipant(roomId, userId).isError()) {
            throw new MessageDeliveryException("Not a participant of chat room");
        }
    }

    // İstemci yalnızca @MessageMapping uçlarına (/app/...) mesaj gönderebilir; broker hedeflerine
    // (/topic, /queue, /user) doğrudan SEND başka kullanıcılara sahte bildirim veya sohbet mesajı iletir.
    private void authorizeSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(APP_DESTINATION_PREFIX)) {
            log.warn("Rejecting WebSocket SEND to non-application destination {}", destination);
            throw new MessageDeliveryException("SEND is only allowed to application destinations");
        }
    }

    private Long currentUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication
                && authentication.getPrincipal() instanceof User user
                && user.getId() != null) {
            return user.getId();
        }
        throw new MessageDeliveryException("WebSocket authentication required");
    }

    private boolean containsPatternOrTraversal(String destination) {
        return destination.contains("*")
                || destination.contains("?")
                || destination.contains("{")
                || destination.contains("}")
                || destination.contains("..");
    }

    private boolean isAuthorizationRequired(StompCommand command) {
        return StompCommand.SEND.equals(command)
                || StompCommand.SUBSCRIBE.equals(command)
                || StompCommand.UNSUBSCRIBE.equals(command);
    }

    // CONNECT akışı: token yoksa veya geçersizse bağlantı reddedilir; bu, anonim STOMP oturumunu engeller.
    private void authenticateConnect(StompHeaderAccessor accessor) {
        String token = extractToken(accessor);
        if (token == null) {
            log.warn("Rejecting WebSocket CONNECT without token");
            throw new MessageDeliveryException("WebSocket authentication required");
        }

        try {
            String username = jwtUtils.extractUsername(token);
            if (username == null) {
                throw new MessageDeliveryException("Invalid JWT token");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtUtils.isTokenValid(token, userDetails)) {
                log.warn("Invalid JWT token for WebSocket connection");
                throw new MessageDeliveryException("Invalid JWT token");
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            accessor.setUser(authentication);
            log.info("WebSocket authenticated user: {}", username);
        } catch (MessageDeliveryException e) {
            throw e;
        } catch (Exception e) {
            log.error("WebSocket authentication failed: {}", e.getMessage());
            throw new MessageDeliveryException("WebSocket authentication failed");
        }
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
