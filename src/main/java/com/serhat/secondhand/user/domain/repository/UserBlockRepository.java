package com.serhat.secondhand.user.domain.repository;

import com.serhat.secondhand.user.domain.entity.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    List<UserBlock> findByBlockerIdOrderByCreatedAtDesc(Long blockerId);

    @Modifying
    @Query("DELETE FROM UserBlock b WHERE b.blockerId = :blockerId AND b.blockedId = :blockedId")
    int deleteByPair(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    @Query("SELECT b.blockedId FROM UserBlock b WHERE b.blockerId = :userId")
    List<Long> findBlockedIdsByBlocker(@Param("userId") Long userId);

    @Query("SELECT b.blockerId FROM UserBlock b WHERE b.blockedId = :userId")
    List<Long> findBlockerIdsByBlocked(@Param("userId") Long userId);
}
