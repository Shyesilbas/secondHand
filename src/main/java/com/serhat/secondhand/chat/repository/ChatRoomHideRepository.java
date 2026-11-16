package com.serhat.secondhand.chat.repository;

import com.serhat.secondhand.chat.entity.ChatRoomHide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomHideRepository extends JpaRepository<ChatRoomHide, Long> {

    Optional<ChatRoomHide> findByChatRoomIdAndUserId(Long chatRoomId, Long userId);
}
