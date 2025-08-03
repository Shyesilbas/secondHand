package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.UUID;

public interface IEmailService {

    EmailDto sendVerificationCodeEmail(User user, String verificationCode);

    EmailDto sendWelcomeEmail(User user);

    EmailDto sendPasswordResetEmail(User user, String resetToken);

    List<EmailDto> getUserEmails();

}