package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.exception.UserAlreadyExistsException;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserNotificationService userNotificationService;
    private final UserMapper userMapper;

    public User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCodes.USER_NOT_FOUND_BY_EMAIL));
    }

    public void save(User user) {
        validateUniqueUser(user.getEmail(), user.getPhoneNumber());
        userRepository.save(user);
        log.info("User saved with email: {}", user.getEmail());
    }

    public void update(User user) {
        userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new BusinessException(UserErrorCodes.USER_NOT_FOUND_BY_EMAIL));
    }

    public Optional<User> findOptionalByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void validateUniqueUser(String email, String phoneNumber) {
        if (userRepository.existsByEmail(email) || userRepository.existsByPhoneNumber(phoneNumber)) {
            throw UserAlreadyExistsException.withCredentials(email,phoneNumber);
        }
    }

    public String updatePhone(UpdatePhoneRequest updatePhoneRequest, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        String currentPhone = user.getPhoneNumber();
        String requestedPhone = updatePhoneRequest.newPhoneNumber();

        if (currentPhone.equals(requestedPhone)) {
            throw new BusinessException(UserErrorCodes.PHONE_NUMBER_UNCHANGED);
        }

        if (userRepository.existsByPhoneNumber(requestedPhone)) {
            throw new BusinessException(UserErrorCodes.PHONE_NUMBER_ALREADY_IN_USE);
        }

        user.setPhoneNumber(requestedPhone);
        update(user);
        log.info("User phone number updated for user: {}, new phone number: {}", user.getEmail(), requestedPhone);
        userNotificationService.sendPhoneNumberUpdatedNotification(user);
        return "Phone number updated successfully.";
    }


    public String updateEmail(UpdateEmailRequest updateEmailRequest, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        String currentEmail = user.getEmail();
        String requestedEmail = updateEmailRequest.newEmail();

        if (currentEmail.equals(requestedEmail)) {
            throw new BusinessException(UserErrorCodes.EMAIL_UNCHANGED);
        }

        if (userRepository.existsByEmail(requestedEmail)) {
            throw new BusinessException(UserErrorCodes.EMAIL_ALREADY_IN_USE);
        }

        user.setEmail(requestedEmail);
        update(user);
        log.info("Email updated successfully from: {}, to: {}, by user: {}", currentEmail, requestedEmail, user.getId());
        return "Email updated successfully.";
    }

    public UserDto getCurrentUserProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return userMapper.toDto(user);
    }

    public User findById(Long id){
        return userRepository.findById(id).orElseThrow(() -> new BusinessException(UserErrorCodes.USER_NOT_FOUND_BY_ID));
    }

    public UserDto getById(Long id){
        return userRepository.findById(id).map(userMapper::toDto)
                .orElseThrow(() -> new BusinessException(UserErrorCodes.USER_NOT_FOUND_BY_ID));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserDto> searchUsers(String query, int limit) {
        log.info("Searching users with query: {} and limit: {}", query, limit);
        
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        
        Pageable pageable = PageRequest.of(0, limit);
        List<User> users = userRepository.searchUsers(query.trim(), pageable);
        return users.stream()
                .map(userMapper::toDto)
                .toList();
    }

}
