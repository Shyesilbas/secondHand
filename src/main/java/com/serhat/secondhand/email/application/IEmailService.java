package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.dto.EmailDto;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;


public interface IEmailService {

    EmailDto sendVerificationCodeEmail(User user, String verificationCode);

    EmailDto sendWelcomeEmail(User user);

    EmailDto sendPhoneNumberUpdatedEmail(User user);

    List<EmailDto> getUserEmails();

}