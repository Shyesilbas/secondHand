package com.serhat.secondhand.user.api;

import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.application.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping
    public ResponseEntity<UserDto> getUser(String email){
        return ResponseEntity.ok(new UserDto(userService.findByEmail(email)));
    }
}
