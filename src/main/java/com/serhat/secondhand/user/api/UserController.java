package com.serhat.secondhand.user.api;

import com.serhat.secondhand.auth.application.AuthService;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final IUserService userService;
    private final AuthService authService;

    @PostMapping("/send-code")
    public void sendVerificationCode() {
        userService.sendVerificationCode();
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(Authentication authentication) {

        String username = authentication.getName();
        LoginResponse response = authService.getAuthenticatedUser(username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public void verifyUser(@RequestBody VerificationRequest request) {
        userService.verifyUser(request);
    }

    @PutMapping("/updateEmail")
    public ResponseEntity<String> updateEmail(@RequestBody @Valid UpdateEmailRequest request) {
        return ResponseEntity.ok(userService.updateEmail(request));
    }

    @PutMapping("/updatePhone")
    public ResponseEntity<String> updateEmail(@RequestBody @Valid UpdatePhoneRequest request) {
       return ResponseEntity.ok(userService.updatePhone(request));
    }

}
