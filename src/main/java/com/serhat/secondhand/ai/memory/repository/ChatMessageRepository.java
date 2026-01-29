package com.serhat.secondhand.ai.memory.repository;

import com.serhat.secondhand.ai.memory.ChatMessage;
import com.serhat.secondhand.ai.memory.ChatRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop30ByUserIdOrderByTimestampDesc(Long userId);
    void deleteByUserId(Long userId);
    long countByUserIdAndRole(Long userId, ChatRole role);
}
