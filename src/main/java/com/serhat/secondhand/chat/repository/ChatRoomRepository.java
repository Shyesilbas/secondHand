package com.serhat.secondhand.chat.repository;

import com.serhat.secondhand.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
        @Query("SELECT cr FROM ChatRoom cr WHERE :userId MEMBER OF cr.participantIds ORDER BY cr.lastMessageTime DESC NULLS LAST, cr.updatedAt DESC")
    List<ChatRoom> findByParticipantIdOrderByLastMessageTimeDesc(@Param("userId") Long userId);
    
        @Query("SELECT cr FROM ChatRoom cr WHERE cr.roomType = 'DIRECT' AND :userId1 MEMBER OF cr.participantIds AND :userId2 MEMBER OF cr.participantIds")
    Optional<ChatRoom> findDirectChatRoom(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
        @Query("SELECT COUNT(m) FROM Message m WHERE m.chatRoomId = :chatRoomId AND m.recipient.id = :userId AND m.isRead = false")
    Long countUnreadMessagesByChatRoomAndUser(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);

    @Query("""
select r.id
from ChatRoom r
where :userId member of r.participantIds
""")
    List<Long> findRoomIdsByParticipantId(@Param("userId") Long userId);


}
