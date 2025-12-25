package com.serhat.secondhand.chat.mapper;

import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.entity.ChatRoom;
import org.springframework.stereotype.Component;


@Component
public class ChatRoomMapper {

    public ChatRoom toEntity(String roomName, ChatRoom.RoomType type, String listingId) {
        ChatRoom room = new ChatRoom();
        room.setRoomName(roomName);
        room.setRoomType(type);
        room.setListingId(listingId);
        return room;
    }

    public ChatRoomDto toDto(ChatRoom room) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(room.getId());
        dto.setTitle(room.getRoomName());
        dto.setRoomType(room.getRoomType().name());
        dto.setListingId(room.getListingId());
        dto.setParticipantIds(room.getParticipantIds());
        dto.setLastMessage(room.getLastMessage());
        dto.setLastMessageTime(room.getLastMessageTime());
        dto.setLastMessageSenderId(room.getLastMessageSenderId());
        return dto;
    }

}
