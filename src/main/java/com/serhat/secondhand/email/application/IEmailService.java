package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.security.core.Authentication;

import java.util.List;


public interface IEmailService {

    EmailDto sendVerificationCodeEmail(User user, String verificationCode);

    EmailDto sendWelcomeEmail(User user);

    EmailDto sendPhoneNumberUpdatedEmail(User user);

    List<EmailDto> getUserEmails();
    
    // Controller-specific methods with Authentication
    List<EmailDto> getUserEmails(Authentication authentication);
    EmailDto sendWelcomeEmail(Authentication authentication);

}