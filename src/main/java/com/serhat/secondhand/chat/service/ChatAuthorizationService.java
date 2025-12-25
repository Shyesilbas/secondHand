package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.application.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatAuthorizationService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    public void validateUsersExist(Long... userIds) {
        for (Long id : userIds) {
            userService.findById(id);
        }
    }

    public ChatRoom authorizeRoomAccess(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.CHAT_ROOM_NOT_FOUND));

        if (!room.getParticipantIds().contains(userId)) {
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);
        }

        return room;
    }

    public void validateRoomParticipant(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.CHAT_ROOM_NOT_FOUND));

        if (!room.getParticipantIds().contains(userId)) {
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);
        }
    }

    public Message validateMessageOwner(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.MESSAGE_NOT_FOUND));

        if (!message.getSender().getId().equals(userId)) {
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);
        }

        return message;
    }

    public void authorizeMessageParticipants(ChatRoom room, Long senderId, Long recipientId) {
        if (senderId.equals(recipientId)) {
            throw new BusinessException(ChatErrorCodes.INVALID_MESSAGE_CONTENT);
        }

        if (!room.getParticipantIds().contains(senderId)
                || !room.getParticipantIds().contains(recipientId)) {
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);
        }
    }

    public void validateMessageContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BusinessException(ChatErrorCodes.INVALID_MESSAGE_CONTENT);
        }

        if (content.length() > 1000) {
            throw new BusinessException(ChatErrorCodes.MESSAGE_TOO_LONG);
        }
    }
}
