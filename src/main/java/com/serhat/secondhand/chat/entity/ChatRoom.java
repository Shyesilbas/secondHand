package com.serhat.secondhand.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chat_rooms", indexes = {
    @jakarta.persistence.Index(name = "idx_chat_rooms_last_msg_time", columnList = "last_message_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "room_name", nullable = false)
    private String roomName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;
    
    @Column(name = "listing_id")
    private String listingId;

    @ElementCollection
    @CollectionTable(
        name = "chat_room_participants", 
        joinColumns = @JoinColumn(name = "chat_room_id"),
        indexes = {
            @Index(name = "idx_chat_room_participants_user", columnList = "user_id"),
            @Index(name = "idx_chat_room_participants_room", columnList = "chat_room_id")
        }
    )
    @Column(name = "user_id")
    private Set<Long> participantIds = new HashSet<>();

    
    @Column(name = "last_message")
    private String lastMessage;
    
    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;
    
    @Column(name = "last_message_sender_id")
    private Long lastMessageSenderId;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum RoomType {
        DIRECT,
        LISTING         }
}
