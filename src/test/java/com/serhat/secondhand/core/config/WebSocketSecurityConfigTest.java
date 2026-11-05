package com.serhat.secondhand.core.config;

import com.serhat.secondhand.auth.application.AccessRevocationService;
import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class WebSocketSecurityConfigTest {

    private final ChatAuthorizationService chatAuth = mock(ChatAuthorizationService.class);
    private final AccessRevocationService revocation = mock(AccessRevocationService.class);
    private ChannelInterceptor interceptor;

    @BeforeEach
    void setUp() {
        ChannelRegistration registration = mock(ChannelRegistration.class);
        new WebSocketSecurityConfig(mock(JwtUtils.class), mock(UserDetailsService.class), chatAuth, revocation)
                .configureClientInboundChannel(registration);
        ArgumentCaptor<ChannelInterceptor> captor = ArgumentCaptor.forClass(ChannelInterceptor.class);
        verify(registration).interceptors(captor.capture());
        interceptor = captor.getValue();
    }

    private Message<byte[]> subscribe(String destination) {
        User user = new User();
        user.setId(7L);
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination(destination);
        accessor.setUser(new UsernamePasswordAuthenticationToken(user, null));
        accessor.setSessionAttributes(connectedSession());
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    @Test
    void nonParticipant_cannotSubscribeToChatRoom() {
        when(chatAuth.validateRoomParticipant(105L, 7L)).thenReturn(Result.error(ChatErrorCodes.ACCESS_DENIED));

        assertThatThrownBy(() -> interceptor.preSend(subscribe("/topic/chat/105"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    @Test
    void participant_canSubscribeToChatRoom() {
        when(chatAuth.validateRoomParticipant(105L, 7L)).thenReturn(Result.success());
        Message<byte[]> message = subscribe("/topic/chat/105");

        assertThat(interceptor.preSend(message, null)).isSameAs(message);
    }

    @Test
    void malformedRoomId_isRejected() {
        assertThatThrownBy(() -> interceptor.preSend(subscribe("/topic/chat/abc"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    @Test
    void user_canSubscribeToOwnUserDestinations() {
        Message<byte[]> notifications = subscribe("/user/7/notifications");
        Message<byte[]> messages = subscribe("/user/7/queue/messages");

        assertThat(interceptor.preSend(notifications, null)).isSameAs(notifications);
        assertThat(interceptor.preSend(messages, null)).isSameAs(messages);
    }

    @Test
    void user_cannotSubscribeToAnotherUsersNotifications() {
        assertThatThrownBy(() -> interceptor.preSend(subscribe("/user/8/notifications"), null))
                .isInstanceOf(MessageDeliveryException.class);
        assertThatThrownBy(() -> interceptor.preSend(subscribe("/user/70/notifications"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    @Test
    void wildcardAndTraversalSubscriptions_areRejected() {
        for (String destination : new String[]{"/user/**", "/topic/**", "/topic/chat/*", "/user/7/../8/notifications"}) {
            assertThatThrownBy(() -> interceptor.preSend(subscribe(destination), null))
                    .as(destination)
                    .isInstanceOf(MessageDeliveryException.class);
        }
        verifyNoInteractions(chatAuth);
    }

    @Test
    void broadcastTopic_isAllowed_andUnknownDestinations_areRejected() {
        Message<byte[]> broadcast = subscribe("/topic/notifications");

        assertThat(interceptor.preSend(broadcast, null)).isSameAs(broadcast);
        assertThatThrownBy(() -> interceptor.preSend(subscribe("/queue/messages"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    @Test
    void send_isOnlyAllowedToApplicationDestinations() {
        Message<byte[]> appMessage = send("/app/chat.sendMessage");

        assertThat(interceptor.preSend(appMessage, null)).isSameAs(appMessage);
        assertThatThrownBy(() -> interceptor.preSend(send("/topic/chat/105"), null))
                .isInstanceOf(MessageDeliveryException.class);
        assertThatThrownBy(() -> interceptor.preSend(send("/user/8/notifications"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    private Message<byte[]> send(String destination) {
        User user = new User();
        user.setId(7L);
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination(destination);
        accessor.setUser(new UsernamePasswordAuthenticationToken(user, null));
        accessor.setSessionAttributes(connectedSession());
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    // What authenticateConnect stores for a connection authenticated as user 7.
    private Map<String, Object> connectedSession() {
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("ws_auth_user_id", 7L);
        attrs.put("ws_auth_token_id", "jti-1");
        return attrs;
    }

    @Test
    void revokedAccess_rejectsSubscribeAndSendOnOpenConnection() {
        when(revocation.isRevoked(eq(7L), any(), eq("jti-1"))).thenReturn(true);

        assertThatThrownBy(() -> interceptor.preSend(subscribe("/topic/notifications"), null))
                .isInstanceOf(MessageDeliveryException.class);
        assertThatThrownBy(() -> interceptor.preSend(send("/app/chat.sendMessage"), null))
                .isInstanceOf(MessageDeliveryException.class);
    }

    @Test
    void sessionWithoutConnectAuth_isRejected() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/notifications");
        User user = new User();
        user.setId(7L);
        accessor.setUser(new UsernamePasswordAuthenticationToken(user, null));
        accessor.setSessionAttributes(new HashMap<>());

        assertThatThrownBy(() -> interceptor.preSend(
                MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders()), null))
                .isInstanceOf(MessageDeliveryException.class);
    }
}
