package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.Optional;

public interface IUserService {

    void save(User user);
    void update(User user);
    User findByEmail(String email);
    Optional<User> findOptionalByEmail(String email);
    void validateUniqueUser(String email, String phoneNumber);
    void verifyUser(VerificationRequest request);
    void sendVerificationCode();
    String updateEmail(UpdateEmailRequest updateEmailRequest);
    String updatePhone(UpdatePhoneRequest updatePhoneRequest);
}
