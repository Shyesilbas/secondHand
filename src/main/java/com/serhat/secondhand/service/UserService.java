package com.serhat.secondhand.service;

import com.serhat.secondhand.entity.User;
import com.serhat.secondhand.exception.User.UserAlreadyExistsException;
import com.serhat.secondhand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;

    @Override
    public boolean existByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existByPhone(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException(email));
    }

    @Override
    public void save(User user) {
        validateUniqueUser(user.getEmail(), user.getPhoneNumber());
        userRepository.save(user);
        log.info("User saved with email: {}", user.getEmail());
    }

    @Override
    public void update(User user) {
        userRepository.save(user);
    }

    @Override
    public void validateUniqueUser(String email, String phoneNumber) {
        if (existByEmail(email)) {
            throw UserAlreadyExistsException.withEmail(email);
        }
        
        if (existByPhone(phoneNumber)) {
            throw UserAlreadyExistsException.withPhone(phoneNumber);
        }
    }
}
