package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.exception.AuthenticationNotFoundException;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.verification.VerificationCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final IUserService userService;

    @PostMapping("/send-code")
    public void sendVerificationCode() {
        userService.sendVerificationCode();
    }


    @PostMapping("/verify")
    public void verifyUser(@RequestBody VerificationRequest request) {
        userService.verifyUser(request);
    }

}
