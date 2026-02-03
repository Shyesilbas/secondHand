package com.serhat.secondhand.forum.repository;

import com.serhat.secondhand.forum.entity.ForumThreadReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForumThreadReactionRepository extends JpaRepository<ForumThreadReaction, Long> {
    Optional<ForumThreadReaction> findByThreadIdAndUserId(Long threadId, Long userId);
    void deleteByThreadIdAndUserId(Long threadId, Long userId);
    void deleteByThreadId(Long threadId);
}

