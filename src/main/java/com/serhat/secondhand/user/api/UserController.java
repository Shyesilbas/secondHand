package com.serhat.secondhand.user.api;

import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/updateEmail")
    public void updateEmail(@RequestBody @Valid UpdateEmailRequest request) {
        userService.updateEmail(request);
    }

}
