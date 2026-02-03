package com.serhat.secondhand.forum.repository;

import com.serhat.secondhand.forum.entity.ForumComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    Page<ForumComment> findByThreadId(Long threadId, Pageable pageable);

    void deleteByThreadId(Long threadId);

    @Query("select c.id from ForumComment c where c.threadId = :threadId")
    List<Long> findIdsByThreadId(@Param("threadId") Long threadId);
}

