package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.user.util.UserErrorCodes;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.exception.UserAlreadyExistsException;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import com.serhat.secondhand.user.domain.repository.UserRepository;
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
    private final EmailService emailService;
    private final IVerificationService verificationService;
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
        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException.withEmail(email);
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw UserAlreadyExistsException.withPhone(phoneNumber);
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
        emailService.sendPhoneNumberUpdatedEmail(user);
        return "Phone number updated successfully.";
    }

    public void sendVerificationCode(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if (user.isAccountVerified()) {
            throw new BusinessException(UserErrorCodes.ACCOUNT_ALREADY_VERIFIED);
        }

        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.ACCOUNT_VERIFICATION);
        emailService.sendVerificationCodeEmail(user, code);

        log.info("Verification code sent to user with email: {}", user.getEmail());
    }

    public void verifyUser(VerificationRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        log.info("Verifying user with email: {}", user.getEmail());
        log.info("Code written by user: {}", request.code());

        var verificationOpt = verificationService.findLatestActiveVerification(user, CodeType.ACCOUNT_VERIFICATION);

        if (verificationOpt.isEmpty()) {
            throw new BusinessException(UserErrorCodes.NO_ACTIVE_VERIFICATION_CODE);
        }

        var verification = verificationOpt.get();
        log.info("Stored verification code: {}", verification.getCode());

        if (!request.code().equals(verification.getCode())) {
            verificationService.decrementVerificationAttempts(verification);
            int verificationAttemptLeft = verification.getVerificationAttemptLeft();

            if (verificationAttemptLeft <= 0) {
                user.setAccountStatus(AccountStatus.BLOCKED);
                update(user);
                throw new VerificationLockedException("Too many failed attempts. Your account has been blocked.");
            }
            throw new BusinessException(
                    String.format(UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getMessage(), verificationAttemptLeft),
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getHttpStatus(), 
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getCode());
        }

        verificationService.markVerificationAsUsed(verification);
        user.setAccountVerified(true);
        update(user);

        log.info("User verified successfully: {}", user.getEmail());
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
