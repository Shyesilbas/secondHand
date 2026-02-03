package com.serhat.secondhand.forum.repository;

import com.serhat.secondhand.forum.entity.ForumThread;
import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {

    @Query("""
            select t
            from ForumThread t
            where (:category is null or t.category = :category)
              and (:status is null or t.status = :status)
              and (:q is null or :q = '' or (
                    lower(t.title) like lower(concat('%', :q, '%'))
                 or lower(t.description) like lower(concat('%', :q, '%'))
                 or lower(t.keywordsJson) like lower(concat('%', :q, '%'))
              ))
            """)
    Page<ForumThread> search(
            @Param("category") ForumCategory category,
            @Param("status") ForumThreadStatus status,
            @Param("q") String q,
            Pageable pageable
    );
}

