package com.serhat.secondhand.chat.repository;

import com.serhat.secondhand.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    

        Page<Message> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId, Pageable pageable);
    
        @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.chatRoomId = :chatRoomId AND m.recipient.id = :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
    
    @Query("SELECT m FROM Message m WHERE m.chatRoomId = :chatRoomId ORDER BY m.createdAt DESC")
    List<Message> findAllByChatRoomIdOrderByCreatedAtDesc(@Param("chatRoomId") Long chatRoomId);
    
    default java.util.Optional<Message> findTopByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId) {
        List<Message> messages = findAllByChatRoomIdOrderByCreatedAtDesc(chatRoomId);
        return messages.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(messages.get(0));
    }

    @Query("""
select m.chatRoomId, count(m)
from Message m
where m.chatRoomId in :roomIds
and m.recipient.id = :userId
and m.isRead = false
group by m.chatRoomId
""")
    List<Object[]> countUnreadMessagesByRoomIdsAndUserIdRaw(
            @Param("roomIds") List<Long> roomIds,
            @Param("userId") Long userId
    );

    default Map<Long, Long> countUnreadMessagesByRoomIdsAndUserId(
            List<Long> roomIds,
            Long userId
    ) {
        return countUnreadMessagesByRoomIdsAndUserIdRaw(roomIds, userId)
                .stream()
                .collect(Collectors.toMap(
                        r -> (Long) r[0],
                        r -> (Long) r[1]
                ));
    }

    Page<Message> findByChatRoomIdInOrderByCreatedAtDesc(
            List<Long> chatRoomIds,
            Pageable pageable
    );

    @Query("""
select count(m)
from Message m
where m.recipient.id = :userId
and m.isRead = false
""")
    Long countUnreadMessagesByRecipientId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from Message m where m.chatRoomId = :roomId")
    void deleteByChatRoomId(@Param("roomId") Long roomId);



}
