package com.serhat.secondhand.user.application;

import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.security.core.Authentication;

import java.util.Optional;

public interface IUserService {

    void save(User user);
    void update(User user);
    User findByEmail(String email);
    Optional<User> findOptionalByEmail(String email);
    void validateUniqueUser(String email, String phoneNumber);
    
    // Controller-specific methods with Authentication
    LoginResponse getCurrentUserProfile(Authentication authentication);
    void sendVerificationCode(Authentication authentication);
    void verifyUser(VerificationRequest request, Authentication authentication);
    String updateEmail(UpdateEmailRequest request, Authentication authentication);
    String updatePhone(UpdatePhoneRequest request, Authentication authentication);
    
    // Service-specific methods (legacy)
    void verifyUser(VerificationRequest request);
    void sendVerificationCode();
    String updateEmail(UpdateEmailRequest updateEmailRequest);
    String updatePhone(UpdatePhoneRequest updatePhoneRequest);

}
