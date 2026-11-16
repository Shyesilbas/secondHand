package com.serhat.secondhand.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A participant's "delete conversation": the room and its messages stay for the other participant and for
 * moderation evidence; this user only sees messages created after {@link #hiddenAt}. The room returns to the
 * user's list when a newer message arrives.
 */
@Entity
@Table(name = "chat_room_hides",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_chat_room_hides_room_user", columnNames = {"chat_room_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_chat_room_hides_user", columnList = "user_id")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomHide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "hidden_at", nullable = false)
    private LocalDateTime hiddenAt;
}
