package com.serhat.secondhand.user.application;

import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.exception.VerificationCodeMismatchException;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.exception.EmailExistsException;
import com.serhat.secondhand.user.domain.exception.UserAlreadyExistsException;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final IVerificationService verificationService;

    public User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
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
        return userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
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
            throw new BusinessException("New phone number cannot be the same as the old one.", HttpStatus.BAD_REQUEST, "PHONE_UNCHANGED");
        }

        if (userRepository.existsByPhoneNumber(requestedPhone)) {
            throw new BusinessException("Phone number is already in use.", HttpStatus.CONFLICT, "PHONE_IN_USE");
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
            throw new BusinessException("Your account is already verified.", HttpStatus.BAD_REQUEST, "ALREADY_VERIFIED");
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
            throw new VerificationCodeMismatchException("No active verification code found. Please request a new code.",
                    HttpStatus.BAD_REQUEST.toString());
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
            throw new VerificationCodeMismatchException("Incorrect verification code. Attempts left: " + verificationAttemptLeft,
                    HttpStatus.BAD_REQUEST.toString());
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
            throw new BusinessException("New email cannot be the same as the old one.", HttpStatus.BAD_REQUEST, "EMAIL_UNCHANGED");
        }

        if (userRepository.existsByEmail(requestedEmail)) {
            throw new EmailExistsException("The email is already in use.");
        }
        
        // This part is tricky. Changing the email which is the username has security implications.
        // For now, let's assume we create a new token after this and force re-login.
        user.setEmail(requestedEmail);
        update(user);
        log.info("Email updated successfully from: {}, to: {}, by user: {}", currentEmail, requestedEmail, user.getId());
        return "Email update process initiated. Please check your new email for verification.";
    }

    public LoginResponse getCurrentUserProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return new LoginResponse("Current user profile", user.getId(), user.getEmail(), null, null);
    }
}
