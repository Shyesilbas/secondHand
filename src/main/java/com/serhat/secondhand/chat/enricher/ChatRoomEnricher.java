package com.serhat.secondhand.chat.enricher;

import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ChatRoomEnricher {

    public ChatRoomDto enrich(
            ChatRoom room,
            Long currentUserId,
            ChatEnrichmentContext context,
            ChatRoomDto dto
    ) {
        dto.setUnreadCount(context.getUnreadCount(room.getId()));

        resolveOtherParticipant(room, currentUserId, context, dto);
        resolveLastMessageSender(room, context, dto);

        return dto;
    }

    private void resolveOtherParticipant(
            ChatRoom room,
            Long currentUserId,
            ChatEnrichmentContext context,
            ChatRoomDto dto
    ) {
        room.getParticipantIds().stream()
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .map(context::getUser)
                .ifPresent(user -> {
                    dto.setOtherParticipantId(user.getId());
                    dto.setOtherParticipantName(user.getName() + " " +user.getSurname());
                });
    }



    private void resolveLastMessageSender(
            ChatRoom room,
            ChatEnrichmentContext context,
            ChatRoomDto dto
    ) {
        if (room.getLastMessageSenderId() == null) return;

        User sender = context.getUser(room.getLastMessageSenderId());
        if (sender == null) return;

        dto.setLastMessageSenderId(sender.getId());
        dto.setLastMessageSenderName(sender.getName() + " " + sender.getSurname());
    }



}
