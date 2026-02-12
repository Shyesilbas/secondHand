package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    
    User getAuthenticatedUser(Authentication authentication);
    
    Result<Void> save(User user);
    
    void update(User user);
    
    Result<User> findByEmail(String email);
    
    Optional<User> findOptionalByEmail(String email);
    
    Result<Void> validateUniqueUser(String email, String phoneNumber);
    
    Result<String> updatePhone(UpdatePhoneRequest updatePhoneRequest, Authentication authentication);
    
    Result<String> updateEmail(UpdateEmailRequest updateEmailRequest, Authentication authentication);
    
    UserDto getCurrentUserProfile(Authentication authentication);
    
    Result<User> findById(Long id);
    
    Result<UserDto> getById(Long id);
    
    List<User> getAllUsers();
    
    List<UserDto> searchUsers(String query, int limit);
    
    List<User> findAllByIds(List<Long> ids);
    
    boolean existsById(Long userId);
}
