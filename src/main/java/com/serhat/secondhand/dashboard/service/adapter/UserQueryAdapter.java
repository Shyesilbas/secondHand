package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.dashboard.service.port.UserQueryPort;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserQueryAdapter implements UserQueryPort {

    private final UserService userService;

    @Override
    public User findById(Long id) {
        Result<User> result = userService.findById(id);
        return result.getData();
    }
}

