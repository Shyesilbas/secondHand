package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.VerificationCodeMismatchException;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.exception.UserAlreadyExistsException;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.verification.VerificationCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final VerificationCodeGenerator verificationCodeGenerator;

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
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException(email));
    }

    @Override
    public Optional<User> findOptionalByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void validateUniqueUser(String email, String phoneNumber) {
        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException.withEmail(email);
        }
        
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw UserAlreadyExistsException.withPhone(phoneNumber);
        }
    }

    public void sendVerificationCode() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        String email = authentication.getName();
        User user = findByEmail(email);

        String code = verificationCodeGenerator.generateCode();
        user.setVerificationCode(code);
        user.setVerificationAttemptLeft(3);
        update(user);

        log.info("Verification code generated and sent to user {}: {}", email, code);
    }

    @Override
    public void verifyUser(VerificationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        String email = authentication.getName();
        User user = findByEmail(email);

        String storedCode = user.getVerificationCode();

        log.info("Stored verification code: {}, Code written by user: {} ", storedCode,request.code());

        log.info("Verifying user with email: {}", email);

        if (storedCode == null || !request.code().equals(storedCode)) {
            int verificationAttemptLeft = user.getVerificationAttemptLeft() - 1;
            user.setVerificationAttemptLeft(verificationAttemptLeft);
            update(user);

            if (verificationAttemptLeft <= 0) {
                user.setAccountStatus(AccountStatus.BLOCKED);
                update(user);
                throw new VerificationLockedException("Too many failed attempts");
            }

            throw new VerificationCodeMismatchException("Incorrect verification code. Attempts left: " + verificationAttemptLeft,
                    HttpStatus.BAD_REQUEST.toString());
        }

        user.setAccountVerified(true);
        user.setVerificationCode(null);
        user.setVerificationAttemptLeft(null);
        update(user);

        log.info("User verified successfully: {}", email);
    }

}
