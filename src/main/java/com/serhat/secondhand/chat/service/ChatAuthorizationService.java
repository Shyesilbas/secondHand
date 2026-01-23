package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatAuthorizationService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    public Result<Void> validateUsersExist(Long... userIds) {
        for (Long id : userIds) {
            Result<User> userResult = userService.findById(id);
            if (userResult.isError()) {
                return Result.error(userResult.getMessage(), userResult.getErrorCode());
            }
        }
        return Result.success();
    }

    public Result<ChatRoom> authorizeRoomAccess(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElse(null);
        
        if (room == null) {
            return Result.error(ChatErrorCodes.CHAT_ROOM_NOT_FOUND);
        }

        if (!room.getParticipantIds().contains(userId)) {
            return Result.error(ChatErrorCodes.ACCESS_DENIED);
        }

        return Result.success(room);
    }

    public Result<Void> validateRoomParticipant(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElse(null);
        
        if (room == null) {
            return Result.error(ChatErrorCodes.CHAT_ROOM_NOT_FOUND);
        }

        if (!room.getParticipantIds().contains(userId)) {
            return Result.error(ChatErrorCodes.ACCESS_DENIED);
        }
        return Result.success();
    }

    public Result<Message> validateMessageOwner(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElse(null);
        
        if (message == null) {
            return Result.error(ChatErrorCodes.MESSAGE_NOT_FOUND);
        }

        if (!message.getSender().getId().equals(userId)) {
            return Result.error(ChatErrorCodes.ACCESS_DENIED);
        }

        return Result.success(message);
    }

    public Result<Void> authorizeMessageParticipants(ChatRoom room, Long senderId, Long recipientId) {
        if (senderId.equals(recipientId)) {
            return Result.error(ChatErrorCodes.INVALID_MESSAGE_CONTENT);
        }

        if (!room.getParticipantIds().contains(senderId)
                || !room.getParticipantIds().contains(recipientId)) {
            return Result.error(ChatErrorCodes.ACCESS_DENIED);
        }
        return Result.success();
    }

    public Result<Void> validateMessageContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return Result.error(ChatErrorCodes.INVALID_MESSAGE_CONTENT);
        }

        if (content.length() > 1000) {
            return Result.error(ChatErrorCodes.MESSAGE_TOO_LONG);
        }
        return Result.success();
    }
}
