package com.serhat.secondhand.ai.memory.repository;

import com.serhat.secondhand.ai.dto.UserMemory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMemoryRepository extends JpaRepository<UserMemory, Long> {
}
