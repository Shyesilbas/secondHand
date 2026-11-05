package com.serhat.secondhand.core.config;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class WebSocketSecurityConfigTest {

    private final ChatAuthorizationService chatAuth = mock(ChatAuthorizationService.class);
    private ChannelInterceptor interceptor;

    @BeforeEach
    void setUp() {
        ChannelRegistration registration = mock(ChannelRegistration.class);
        new WebSocketSecurityConfig(mock(JwtUtils.class), mock(UserDetailsService.class), chatAuth)
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
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
