package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankRepository extends JpaRepository<Bank, UUID> {

    Optional<Bank> findByAccountHolder(User user);
    
    boolean existsByAccountHolder(User user);
}
