package com.serhat.secondhand.chat.repository;

import com.serhat.secondhand.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
        Page<Message> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);
    
        Page<Message> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId, Pageable pageable);
    
        @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.chatRoomId = :chatRoomId AND m.recipient.id = :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
    
        @Query("SELECT m FROM Message m WHERE m.chatRoomId = :chatRoomId ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessageByChatRoomId(@Param("chatRoomId") Long chatRoomId);
    
        @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.recipient.id = :userId " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
        @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :userId AND m.isRead = false")
    Long countTotalUnreadMessagesByUser(@Param("userId") Long userId);
    
        @Modifying
    @Query("DELETE FROM Message m WHERE m.chatRoomId = :chatRoomId")
    void deleteByChatRoomId(@Param("chatRoomId") Long chatRoomId);
    
        @Query("SELECT m FROM Message m WHERE m.chatRoomId = :chatRoomId ORDER BY m.createdAt DESC")
    java.util.Optional<Message> findTopByChatRoomIdOrderByCreatedAtDesc(@Param("chatRoomId") Long chatRoomId);
}
