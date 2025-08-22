package com.serhat.secondhand.chat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
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
    private String listingId; // Eğer listing ile ilgili bir chat ise
    
    @ElementCollection
    @CollectionTable(name = "chat_room_participants", 
                     joinColumns = @JoinColumn(name = "chat_room_id"))
    @Column(name = "user_id")
    private List<Long> participantIds;
    
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
        DIRECT,     // İki kişi arası
        LISTING     // Listing ile ilgili chat
    }
}
