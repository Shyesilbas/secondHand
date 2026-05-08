package com.serhat.secondhand.forum.repository;

import com.serhat.secondhand.forum.entity.ForumCommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ForumCommentReactionRepository extends JpaRepository<ForumCommentReaction, Long> {
    List<ForumCommentReaction> findByCommentIdInAndUserId(Collection<Long> commentIds, Long userId);

    Optional<ForumCommentReaction> findByCommentIdAndUserId(Long commentId, Long userId);
    void deleteByCommentIdAndUserId(Long commentId, Long userId);
    void deleteByCommentIdIn(List<Long> commentIds);
}

