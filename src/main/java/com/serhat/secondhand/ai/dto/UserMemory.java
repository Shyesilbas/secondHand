package com.serhat.secondhand.ai.dto;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "user_memories")
public class UserMemory {

    @Id
    @Column(nullable = false)
    private Long userId;

    @Column(length = 200)
    private String userName;

    @Column(length = 50)
    private String preferredTone;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_memory_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest", nullable = false, length = 200)
    private List<String> permanentInterests = new ArrayList<>();

    @Lob
    @Column
    private String summaryOfPastConversations;

    @Lob
    @Column
    private String userNotes;

    @Lob
    @Column
    private String secondHandProfileJson;

    protected UserMemory() {
    }

    public UserMemory(Long userId, String preferredTone) {
        this.userId = userId;
        this.preferredTone = preferredTone;
    }

    public void setUserName(String userName) {
        this.userName = normalize(userName);
    }

    public void setPreferredTone(String preferredTone) {
        this.preferredTone = normalize(preferredTone);
    }

    public void setPermanentInterests(List<String> permanentInterests) {
        this.permanentInterests = permanentInterests == null ? new ArrayList<>() : new ArrayList<>(permanentInterests);
    }

    public void addPermanentInterest(String interest) {
        String normalized = normalize(interest);
        if (normalized == null) {
            return;
        }
        if (permanentInterests.stream().noneMatch(i -> i.equalsIgnoreCase(normalized))) {
            permanentInterests.add(normalized);
        }
    }

    public void setSummaryOfPastConversations(String summaryOfPastConversations) {
        this.summaryOfPastConversations = normalize(summaryOfPastConversations);
    }

    public void setUserNotes(String userNotes) {
        this.userNotes = normalize(userNotes);
    }

    public void setSecondHandProfileJson(String secondHandProfileJson) {
        this.secondHandProfileJson = normalize(secondHandProfileJson);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
