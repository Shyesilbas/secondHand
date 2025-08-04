package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.exception.VerificationCodeMismatchException;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.IEmailService;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.helper.IbanGenerator;
import com.serhat.secondhand.payment.repo.BankRepository;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final IEmailService emailService;
    private final IVerificationService verificationService;

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

    @Override
    public String updatePhone(UpdatePhoneRequest updatePhoneRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user= findByEmail(authentication.getName());

        String currentPhone = user.getPhoneNumber();
        String requestedPhone = updatePhoneRequest.newPhoneNumber();

        if(!currentPhone.equals(requestedPhone)) {
            throw new BusinessException("Phone numbers must be different",HttpStatus.BAD_REQUEST,HttpStatus.BAD_REQUEST.toString());
        }

        boolean existsByPhoneNumber = userRepository.existsByPhoneNumber(requestedPhone);
        if(!existsByPhoneNumber) {
            throw new BusinessException("Phone number is in usage",HttpStatus.CONFLICT,HttpStatus.CONFLICT.toString());
        }

        user.setPhoneNumber(requestedPhone);
        update(user);
        log.info("User phone number updated with email: {} , new Phone number : {}", user.getEmail(), requestedPhone);
        emailService.sendPhoneNumberUpdatedEmail(user);
        return "Phone number updated";

    }

    public void sendVerificationCode() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user= findByEmail(authentication.getName());

        if (!authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        if(user.isAccountVerified()){
            throw new BusinessException("Your account is already verified",HttpStatus.BAD_REQUEST,HttpStatus.BAD_REQUEST.getReasonPhrase());
        }

        String email = authentication.getName();

        String code = verificationService.generateCode();

        verificationService.generateVerification(user, code, CodeType.ACCOUNT_VERIFICATION);
        
        emailService.sendVerificationCodeEmail(user, code);
        
        log.info("Verification code sent to user with email: {}", email);

    }

    @Override
    public void verifyUser(VerificationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        String email = authentication.getName();
        User user = findByEmail(email);

        log.info("Verifying user with email: {}", email);
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
                throw new VerificationLockedException("Too many failed attempts");
            }

            throw new VerificationCodeMismatchException("Incorrect verification code. Attempts left: " + verificationAttemptLeft,
                    HttpStatus.BAD_REQUEST.toString());
        }

        verificationService.markVerificationAsUsed(verification);
        user.setAccountVerified(true);
        update(user);

        log.info("User verified successfully: {}", email);
    }

    @Override
    public String updateEmail(UpdateEmailRequest updateEmailRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = findByEmail(authentication.getName());

        if(!authentication.isAuthenticated() || user == null || !authentication.getName().equals(user.getEmail()))
        {
            throw new AuthenticationNotFoundException("Authentication not found", HttpStatus.UNAUTHORIZED.toString());
        }

        String currentEmail = user.getEmail();
        String requestedEmail = updateEmailRequest.newEmail();

        if(!currentEmail.equals(requestedEmail)) {
            throw new BusinessException("Your current email is same as the requested",HttpStatus.CONFLICT,HttpStatus.CONFLICT.getReasonPhrase());
        }

        if(userRepository.existsByEmail(requestedEmail)) {
            throw new EmailExistsException("The email is in usage");
        }
        user.setEmail(requestedEmail);
        update(user);
        log.info("Email updated successfully from: {}, to : {} , by user : {}",currentEmail,requestedEmail,user);
        return "Email updated";

    }
}
