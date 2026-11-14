package com.serhat.secondhand.chat.application;

import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Read-only chat excerpts for other modules (complaint moderation). Callers own the access check. */
@Service
@RequiredArgsConstructor
public class ChatTranscriptService {

    private final MessageRepository messageRepository;

    public record TranscriptMessage(Long id, Long senderId, LocalDateTime createdAt, String content) {}

    /** The latest {@code limit} messages of the room, oldest first. */
    @Transactional(readOnly = true)
    public List<TranscriptMessage> latestMessages(Long roomId, int limit) {
        List<TranscriptMessage> messages = new ArrayList<>(messageRepository
                .findByChatRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(0, limit))
                .map(ChatTranscriptService::toTranscript)
                .getContent());
        messages.sort(Comparator.comparing(TranscriptMessage::createdAt, Comparator.nullsFirst(Comparator.naturalOrder())));
        return messages;
    }

    @Transactional(readOnly = true)
    public java.util.Optional<TranscriptMessage> findMessage(Long roomId, Long messageId) {
        return messageRepository.findById(messageId)
                .filter(m -> roomId.equals(m.getChatRoomId()))
                .map(ChatTranscriptService::toTranscript);
    }

    private static TranscriptMessage toTranscript(Message m) {
        return new TranscriptMessage(m.getId(), m.getSender().getId(), m.getCreatedAt(), m.getContent());
    }
}
